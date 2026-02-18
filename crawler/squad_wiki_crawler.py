import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import logging
import mimetypes
import re
from collections import deque

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("crawler.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

def get_high_res_url(img_url):
    """
    尝试从 Fandom 的缩略图 URL 中提取高清原图 URL
    """
    # 匹配常见的图片扩展名，忽略大小写
    match = re.search(r'(.+?\.(?:jpg|jpeg|png|gif|webp|svg|bmp))', img_url, re.IGNORECASE)
    if match:
        return match.group(1)
    
    # 如果没有找到扩展名，但包含 /revision/，尝试截断
    if '/revision/' in img_url:
        return img_url.split('/revision/')[0]
        
    return img_url

def extract_links(base_url, soup):
    """
    从页面中提取所有指向同一 Wiki 的有效内容链接
    """
    links = set()
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        # 处理相对路径
        full_url = urljoin(base_url, href)
        
        # 过滤规则：
        # 1. 必须是 squad.fandom.com 下的链接
        # 2. 必须包含 /wiki/
        # 3. 排除特殊页面 (Special:, Talk:, User:, File:, Category: 等)
        # 4. 排除锚点 (#)
        
        parsed = urlparse(full_url)
        if parsed.netloc == 'squad.fandom.com' and parsed.path.startswith('/wiki/'):
            # 排除特殊命名空间
            exclude_prefixes = ['Special:', 'Talk:', 'User:', 'User_talk:', 'File:', 'File_talk:', 
                                'MediaWiki:', 'Template:', 'Help:', 'Category:', 'Forum:']
            page_name = parsed.path.replace('/wiki/', '')
            
            if any(page_name.startswith(prefix) for prefix in exclude_prefixes):
                continue
                
            # 去除 fragment
            clean_url = full_url.split('#')[0]
            links.add(clean_url)
            
    return links

def get_page_name(url):
    """
    从 URL 提取页面名称作为分类目录名
    """
    parsed = urlparse(url)
    path = parsed.path
    if path.startswith('/wiki/'):
        name = path.replace('/wiki/', '')
    else:
        name = "Misc"
    
    # 解码 URL 编码 (e.g. %20 -> space)
    from urllib.parse import unquote
    name = unquote(name)
    
    # 替换非法字符
    name = re.sub(r'[\\/:*?"<>|]', '_', name)
    return name

def process_page(url, base_save_dir, stats, processed_urls):
    """
    处理单个页面：下载图片并保存到对应的分类目录
    """
    try:
        page_name = get_page_name(url)
        # 为该页面创建独立的目录
        save_dir = os.path.join(base_save_dir, page_name)
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            
        logging.info(f"正在分析页面: {url} (分类: {page_name})")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取图片
        img_tags = soup.find_all('img')
        logging.info(f"页面包含 {len(img_tags)} 个图片标签")

        for img in img_tags:
            # 获取图片链接，优先尝试 data-src (处理懒加载)，然后是 src
            img_url = img.get('data-src') or img.get('src')
            
            if not img_url:
                continue

            # 处理相对路径
            img_url = urljoin(url, img_url)
            
            # 尝试获取高清图 URL
            original_url = img_url
            img_url = get_high_res_url(img_url)
            
            # 简单的去重
            if img_url in processed_urls:
                continue
            processed_urls.add(img_url)
            
            stats["total_found"] += 1

            # 生成文件名逻辑 (保留之前的优化)
            parsed_url = urlparse(img_url)
            clean_url_path = parsed_url.path
            
            valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp')
            path_parts = clean_url_path.split('/')
            filename = None
            
            for part in reversed(path_parts):
                if part.lower().endswith(valid_extensions):
                    filename = part
                    break
            
            if not filename:
                filename = os.path.basename(clean_url_path)
            
            if not filename or filename == '':
                filename = f"image_{stats['success'] + 1}"
                if '-' in clean_url_path and len(clean_url_path) > 20:
                     filename = os.path.basename(clean_url_path)

            filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (' ', '.', '-', '_')]).rstrip()
            if len(filename) > 100:
                filename = filename[:100]
            
            temp_filename = filename 
            # save_dir 已经是按页面分类的目录
            save_path = os.path.join(save_dir, temp_filename)

            try:
                # 增加重试机制
                retry_count = 3
                img_response = None
                while retry_count > 0:
                    try:
                        img_response = requests.get(img_url, headers=headers, timeout=15)
                        img_response.raise_for_status()
                        break
                    except Exception as e:
                        retry_count -= 1
                        if retry_count == 0:
                            raise e
                        time.sleep(1)

                # 智能确定最终文件名和扩展名
                content_type = img_response.headers.get('Content-Type', '').split(';')[0]
                guessed_ext = mimetypes.guess_extension(content_type)
                
                name, ext = os.path.splitext(temp_filename)
                
                final_ext = ext
                if guessed_ext:
                    if guessed_ext == '.jpe': guessed_ext = '.jpg'
                    if not ext:
                        final_ext = guessed_ext
                    elif ext.lower() != guessed_ext.lower() and guessed_ext in valid_extensions:
                        if 'image' in content_type:
                             final_ext = guessed_ext
                
                if not final_ext:
                    final_ext = '.jpg'
                    
                final_filename = f"{name}{final_ext}"
                
                # 处理重名
                save_path = os.path.join(save_dir, final_filename)
                counter = 1
                while os.path.exists(save_path):
                    name_base, ext_base = os.path.splitext(final_filename)
                    if re.search(r'_\d+$', name_base):
                         name_base = re.sub(r'_\d+$', '', name_base)
                    save_path = os.path.join(save_dir, f"{name_base}_{counter}{ext_base}")
                    counter += 1
                
                with open(save_path, 'wb') as f:
                    f.write(img_response.content)
                
                if os.path.getsize(save_path) < 1024:
                    logging.warning(f"文件过小，可能无效: {save_path}")
                else:
                    logging.info(f"成功保存: {final_filename}")
                    stats["success"] += 1
                
                time.sleep(0.1) # 稍微快一点
                
            except Exception as e:
                logging.error(f"下载失败 {img_url}: {str(e)}")
                stats["failed"] += 1

        return extract_links(url, soup)

    except Exception as e:
        logging.error(f"处理页面失败 {url}: {str(e)}")
        return set()

def start_crawler(start_url, save_dir, max_depth=1):
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    stats = {
        "total_found": 0,
        "success": 0,
        "failed": 0,
        "skipped": 0
    }
    
    processed_urls = set() # 图片URL去重
    visited_pages = set()  # 页面URL去重
    
    # 队列存储 (url, depth)
    queue = deque([(start_url, 0)])
    
    logging.info(f"开始爬取，最大深度: {max_depth}")
    
    while queue:
        current_url, depth = queue.popleft()
        
        if current_url in visited_pages:
            continue
        visited_pages.add(current_url)
        
        # 传入 base_save_dir (save_dir)
        links = process_page(current_url, save_dir, stats, processed_urls)
        
        # 如果未达到最大深度，将新链接加入队列
        if depth < max_depth:
            for link in links:
                if link not in visited_pages:
                    queue.append((link, depth + 1))
        
        logging.info(f"队列剩余页面数: {len(queue)}")

    summary = f"""
    ==============================
    爬取任务结束
    ------------------------------
    已访问页面数: {len(visited_pages)}
    总共发现图片: {stats['total_found']}
    成功下载图片: {stats['success']}
    下载失败图片: {stats['failed']}
    图片保存目录: {os.path.abspath(save_dir)}
    ==============================
    """
    print(summary)
    logging.info("任务结束")

if __name__ == "__main__":
    TARGET_URL = "https://squad.fandom.com/wiki/Squad_Wiki"
    SAVE_DIR = "images"
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 设置最大深度为 1 (首页 + 首页链接的页面)
    # 如果想爬更多，可以改为 2，但时间会指数级增加
    start_crawler(TARGET_URL, SAVE_DIR, max_depth=1)
