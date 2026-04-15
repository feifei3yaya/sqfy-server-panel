import React from 'react';
import { Card } from 'antd';
import {
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Truck,
  Hammer,
  Gamepad2,
  Shield,
  Settings,
  Star,
} from 'lucide-react';

interface GuideSection {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

const guideSections: GuideSection[] = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Squad 是什么？',
    content: [
      'Squad 是一款 50v50 大规模战术射击游戏',
      '强调团队配合、战术沟通和真实战场体验',
      '需要与队友协作完成目标，而非个人英雄主义',
      '每局游戏 60-90 分钟，节奏紧张刺激',
    ],
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: '基础操作',
    content: [
      'WASD 移动，鼠标瞄准和射击',
      '空格跳跃，Ctrl 蹲伏，Z 卧倒',
      'B 切换瞄准模式（机瞄/瞄具）',
      'F 与载具/设施交互',
      '部署点系统：在队长放置的旗标或 Rally Point 生成',
    ],
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: '通讯系统',
    content: [
      '本地频道：附近队友可听见（默认按键）',
      '小队频道：与小队成员通讯（按 B 切换）',
      '指挥频道：小队长之间的通讯',
      '学会使用报点：方向+距离+目标描述',
      '例如："前方 200 米，树丛后有敌军机枪手"',
    ],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '兵种角色 (Kit)',
    content: [
      'SL (小队长)：建立 Rally Point，指挥小队',
      'Rifleman (步枪兵)：主力战斗人员',
      'Medic (医疗兵)：救治倒地队友',
      'Engineer (工程兵)：建造/维修设施',
      'Machine Gunner (机枪手)：提供火力压制',
      'Marksman (精确射手)：中远距离支援',
      '限制角色：HAT/LAT/Mortar 需要申请且数量有限',
    ],
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '指挥系统',
    content: [
      '小队长 (SL) 职责：制定战术、放置旗标、管理小队',
      '遵循指挥链：队员 → 小队长 → 指挥官',
      '标记目标：在地图上标记敌人位置和攻击目标',
      '不要脱离小队单独行动',
      '新玩家建议先从 Rifleman 或 Medic 开始',
    ],
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: '载具基础',
    content: [
      '运输载具：Humvee、Logi、MTLB 等',
      '战斗载具：坦克、APC、IFV 等',
      '驾驶时注意避开地形障碍',
      '载具需要后勤补给（弹药/燃料）',
      '先学习运输载具，再尝试战斗载具',
    ],
  },
  {
    icon: <Hammer className="w-6 h-6" />,
    title: '设施建造',
    content: [
      'FOB (Forward Operating Base)：前线基地',
      '需要 Logi 运送物资来建造',
      '常用设施：弹药点、重机枪巢、掩体',
      '合理布局防御工事',
      'FOB 被摧毁会导致该区域无法生成',
    ],
  },
  {
    icon: <Gamepad2 className="w-6 h-6" />,
    title: '游戏模式',
    content: [
      'AAS (Advance and Secure)：争夺控制点',
      'Invasion：攻防模式，一方进攻一方防守',
      'Skirmish：小规模冲突',
      'RAAS：随机 AAS，控制点顺序不确定',
      '了解地图和各模式的获胜条件',
    ],
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'FY 社区特色',
    content: [
      '保护萌新：老玩家会主动帮助新人',
      '清晰的规则和管理制度',
      '定期组织训练、夜战、内战活动',
      '友好的社区氛围，拒绝 toxicity',
      'QQ 群：147724008',
    ],
  },
];

const NewbieGuide: React.FC = () => (
  <div className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
    <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
      <BookOpen />
      <span>新手指南</span>
    </div>
    <h2 className="text-3xl font-bold text-white mb-2">欢迎加入 FY 社区</h2>
    <p className="text-slate-300 mb-8">
      这份指南将帮助你快速上手 Squad 并融入 FY 社区。无论你是完全的新手还是有一定经验的玩家，
      这里都有你需要的 information。
    </p>

    <div className="space-y-6">
      {guideSections.map((section, index) => (
        <Card
          key={index}
          variant="borderless"
          className="rounded-2xl border border-amber-400/10 bg-black/20"
          styles={{ body: { padding: 24 } }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400">
              {section.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{section.title}</h3>
          </div>
          <ul className="space-y-2">
            {section.content.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 mt-1.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>

    <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-6 py-5">
      <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
        <Settings className="w-5 h-5" />
        还需要帮助？
      </div>
      <p className="text-slate-300 text-sm leading-7">
        如果你在游戏中遇到任何问题，不要犹豫，加入我们的
        <a
          href="https://qm.qq.com/q/s4mZxx1eQ8"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline mx-1"
        >
          QQ 群 147724008
        </a>
        ，我们的老玩家会很乐意帮助你。记住，每个高手都曾是萌新！
      </p>
    </div>
  </div>
);

export default NewbieGuide;
