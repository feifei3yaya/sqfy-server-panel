import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import {
  AlertTriangle,
  Clock,
  Users,
  Truck,
  MapPin,
  Flag,
  Shield,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Button } from 'antd';

const RulesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-black/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 mb-6">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">服务器规则</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              FY 肥鸭服务器{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                完整规则
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
              轻规则、重体验，打造和谐的战术小队游戏环境。
              本规则旨在保障所有玩家的游戏体验，维护社区秩序。
            </p>
            <div className="mt-8">
              <Button
                size="large"
                type="primary"
                icon={<ArrowRightOutlined />}
                href="#core-rules"
                className="!border-none !bg-amber-400 !px-8 !font-semibold !text-black hover:!bg-amber-300"
              >
                核心红线
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Server Info */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <FileText />
            <span>服务器信息</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-900/10 to-transparent border border-amber-400/10">
              <h3 className="font-semibold text-white mb-2">服务器名称</h3>
              <p className="text-slate-300">
                【CN/EN】FY肥鸭服务器-24小时萌新友好-随机攻守-投票地图-活跃OP在线值班-暖服送预留位不排队
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-400/10">
              <h3 className="font-semibold text-white mb-2">QQ交流群</h3>
              <a
                href="https://qm.qq.com/q/s4mZxx1eQ8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-400 transition-colors flex items-center gap-2"
              >
                <span>147724008 (点击加入)</span>
                <ArrowRightOutlined className="w-4 h-4" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-green-900/10 to-transparent border border-green-400/10">
              <h3 className="font-semibold text-white mb-2">社区特色</h3>
              <p className="text-slate-300">
                老带新教学氛围，定期举办战术教学与娱乐内战，欢迎萌新与战队入驻！
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-900/20 via-orange-900/10 to-red-900/20 border border-amber-400/20">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              我们的信条
            </h3>
            <p className="text-slate-300 leading-relaxed">
              本服致力于打造<strong className="text-amber-300">轻规则、重体验</strong>的竞技环境。
              我们鼓励老玩家指导新玩家，杜绝恶意压家与鱼塘局，让每一场战斗都充满博弈的乐趣。
            </p>
            <p className="text-slate-300 leading-relaxed mt-2">
              <strong className="text-amber-300">遇到问题？</strong> 公屏直接呼叫“OP或管理”，我们就在你身边！
            </p>
            <p className="text-slate-300 leading-relaxed mt-2">
              本服遵循社会主义核心价值观，共建和谐游戏环境。
            </p>
          </div>
        </div>

        {/* Core Rules */}
        <section id="core-rules" className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>一、核心红线 | 零容忍</span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: '严禁恶意TK',
                desc: '误伤队友请务必在公屏输入 !sorry 或语音道歉。恶意TK/炸鱼塘将被永久封禁。',
              },
              {
                title: '严禁作弊/脚本',
                desc: '禁止外挂、宏、透视、去除草木等作弊行为。',
              },
              {
                title: '严禁恶意利用BUG',
                desc: '经管理警告后仍不整改者，先踢出服务器；继续进服并重复行为者，处以1-7天封禁。',
              },
              {
                title: '严禁政治与广告',
                desc: '禁止发布代练、外挂广告及反动、辱华、种族歧视等敏感言论。',
              },
              {
                title: '严禁言语暴力与引战',
                desc: '禁止辱骂、人身攻击、公屏抓挂引战。',
              },
              {
                title: '严禁破坏友方体验',
                desc: '出现被举报且核实的恶意行为，OP有权直接逐出或封禁。',
              },
              {
                title: '严禁消极游戏与内鬼行为',
                desc: '禁止恶意送票、报点给敌方、破坏己方兵站/载具。',
              },
              {
                title: '严禁无麦带队',
                desc: '队长必须能交流；外语玩家若不破坏游戏秩序，OP不作处理。',
              },
            ].map((rule, index) => (
              <div key={index} className="rounded-2xl border border-red-400/20 bg-red-900/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-400/20 text-red-400 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{rule.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Warm Up Rules */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Clock className="w-5 h-5" />
            <span>二、暖服规则 (&lt;80人)</span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: '范围限制',
                desc: '仅在地图中间点及其周边进行步兵战斗，禁止去往非交战区。',
              },
              {
                title: '禁止行为',
                desc: '禁止拆除敌方兵站(FOB)、禁止压家、禁止使用重型载具/迫击炮/陶氏。',
              },
              {
                title: '结束条件',
                desc: '当服务器人数达到 80人 以上，管理员(OP)宣布暖服结束，Live开始。',
              },
            ].map((rule, index) => (
              <div key={index} className="rounded-2xl border border-amber-400/20 bg-amber-900/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{rule.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Squad Rules */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Users />
            <span>三、小队与指挥官规则</span>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">1. 抱团与报备</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>开黑抱团超过 5人 必须提前向值班OP报备。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>退场请有序离场，避免大规模瞬退导致凉服；违规者本服可谢绝入场。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">2. 队长资格与职责</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>队长必须有麦、积极沟通，不得无故甩锅；故意甩锅可处3天封禁。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>队长需按规定使用队长兵种，经提醒仍不更换可逐出队伍/解散队伍/踢出服务器。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>带队时长要求：步兵 300h、载具 300h、指挥官 300h。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>低于要求时长带队：警告三次无果后踢出当局。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">3. 锁队与组队</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>正规编制步兵队不允许锁队；OP警告后不解锁将踢出服务器。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>指挥官队可锁队；特殊情况需配合OP要求调整。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">4. 队长管理权</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>队长有权筛选队员、分配副队长与调整编制。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>禁止无故踢出队员。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">5. 指挥官权限</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>指挥官可协调全局部署、调配未被使用的载具与补给卡。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>载具队顺序争议优先由本方指挥官调节，无法调节时ALL频道呼叫OP处理。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vehicle Rules */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Truck />
            <span>四、队伍编制、载具与兵种规范</span>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">1. 载具归属 (建队时间优先)</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>判定标准：谁先建队谁拥有优先权（公屏输入 !time 查询）。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>队名需规范（MBT/IFV/BTR/HELI等）；乱命名者无优先权。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>ZCC仅承认手摇权，不承认RWS队名优先。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>建队时间冲突时，按队名规范度与实际编制合理性判定。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">2. 编制人数限制</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>坦克队最低3人；不足可锁双载出门（服务器&lt;40人可单载）。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>IFV/APC/轻反坦克侦察车/BMP防空车最低2人，最高4人。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>直升机队最低1人，最高3人。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>侦察车队最高5人；特殊地图侦察车为顶级载具时最低2人。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>每边支援队最多1队，上限5人；特殊编制需提前向OP说明。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">3. 使用限制</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>重型载具（坦克/步战）禁止单人驾驶（Solo），必须双人以上车组。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>禁止单人开载具送前线后随意弃车（特别是补给卡/重载）。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>载具炸了就退，按严重违规处理，最低处以7天封禁。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">4. 补给卡与支援武器</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>步兵队优先补给卡使用权，指挥官可调控补给卡分配。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>IED与迫击炮队仅允许使用1台补给卡。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">5. 兵种限制</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>载具队与支援队禁止拿重筒(HAT)，将重火资源优先留给步兵队。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>不允许使用“投降兵种”，警告后不更换将踢出服务器。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>载具队伍、迫击炮/固定反坦克队伍允许非常规时段切换其他装备。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Camping Rules */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 mb-12">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <MapPin />
            <span>五、压家与兵站规则</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-purple-400/20 bg-purple-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">1. 通用压家定义 (Main Camping)</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>大地图主基地 1.5个FOB圈 (450m)；小地图 1个FOB圈 (300m)。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>严禁步兵/载具进入该范围或向内开火。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">2. 纳尔瓦特殊规则</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>左侧阵营：主基地外 1个FOB圈 内禁止开火与埋雷。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>右侧阵营：过深水桥后 50米 内禁止开火与埋雷。</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">3. 直升机开局限制</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                开局前10分钟禁止神风。
              </p>
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">4. 兵站(FOB)规则</h4>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>禁止在主基地门口建立拦截型FOB（恶意堵门）。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1.5">•</span>
                  <span>鼓励建立进攻/防守FOB，禁止恶意拆除己方有战术价值的FOB。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Punishment Rules */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Shield />
            <span>六、违规处理与申诉</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">1. 执法梯度</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                口头提醒/警告 → 踢出服务器 → 临时封禁 → 长期封禁。
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">2. 举报方式</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                游戏内发现违规请截图/录像并联系在线OP，或加群提交证据。
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">3. 封禁申诉</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                对处罚有异议可进群联系管理员复核。
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">4. 联系方式</h4>
              <a
                href="https://qm.qq.com/q/s4mZxx1eQ8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm"
              >
                <span>加入【SquadFY服务器交流群】：147724008</span>
                <ArrowRightOutlined className="w-4 h-4" />
              </a>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                （加群获取最新资讯、举报作弊、申请解封、投诉OP违规操作）
              </p>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-900/10 p-5">
              <h4 className="font-semibold text-white mb-3">5. 萌新福利</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                萌新进群有老玩家教学，欢迎来群学习交流。
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500">
                <span>版本号：v4.6</span>
              </div>
              <div className="text-sm text-slate-500">
                <span>最后更新：2026-03-14</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default RulesPage;
