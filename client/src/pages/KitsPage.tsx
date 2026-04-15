import React from 'react';
import {
  Crosshair,
  ShieldPlus,
  HeartPulse,
  Wrench,
  Target,
  Radio,
  UserCheck,
  AlertTriangle,
  Info,
  Star,
  Swords,
  Users,
} from 'lucide-react';

interface KitInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  primaryWeapon: string;
  equipment: string[];
  role: string;
  tips: string[];
}

const kitsData: KitInfo[] = [
  {
    id: 'rifleman',
    name: '步枪手',
    nameEn: 'Rifleman',
    icon: <Crosshair className="w-6 h-6" />,
    color: 'blue',
    description:
      '步兵班的基础战斗单位，装备突击步枪，是班火力输出的核心。适合中近距离作战，能够独立完成多种任务。',
    primaryWeapon: 'M4 / AK-74 / L85A2',
    equipment: ['突击步枪', '手榴弹 x2', '绷带 x2', '弹药箱'],
    role: ' frontline combat, objective capture',
    tips: [
      '跟随班长指令，不要脱离小队',
      '优先使用瞄准镜进行精确射击',
      '注意保存弹药，合理使用弹药箱补给队友',
      '在建筑物内作战时注意检查角落',
    ],
  },
  {
    id: 'medic',
    name: '医疗兵',
    nameEn: 'Medic',
    icon: <HeartPulse className="w-6 h-6" />,
    color: 'red',
    description:
      '团队的生命线，负责救治受伤队友。医疗兵的存在大大提高小队的持续作战能力和生存率。是每个小队必不可少的角色。',
    primaryWeapon: 'M4 / AK-74 (带握把)',
    equipment: ['突击步枪', '医疗包', '绷带 x2', '注射器'],
    role: 'healing, reviving teammates',
    tips: [
      '时刻关注队友血条，及时治疗',
      '使用注射器复活倒地队友（需安全环境）',
      '自身安全第一，不要冒险救人',
      '与班长保持适当距离，便于快速响应',
    ],
  },
  {
    id: 'engineer',
    name: '战斗工程师',
    nameEn: 'Combat Engineer',
    icon: <Wrench className="w-6 h-6" />,
    color: 'orange',
    description:
      '负责建造和维修防御工事、补给设施。工程师是小队建立据点的关键角色，也是破坏敌方设施的专家。',
    primaryWeapon: '卡宾枪 / 冲锋枪',
    equipment: [
      '建造工具',
      '地雷 / C4 / 火箭筒',
      '修理工具',
      '弹药箱',
    ],
    role: 'construction, fortification, repair',
    tips: [
      '在安全位置建造 respawn 点和补给站',
      '利用地形建造掩体和防御工事',
      '用火箭筒摧毁敌方载具和建筑',
      '修复受损的友方载具和设施',
    ],
  },
  {
    id: 'machinegunner',
    name: '重机枪手',
    nameEn: 'Machine Gunner',
    icon: <Swords className="w-6 h-6" />,
    color: 'purple',
    description:
      '提供强大的压制火力，能够在远距离对敌军区域进行火力覆盖。需要部署脚架才能发挥最大威力，适合防守和支援任务。',
    primaryWeapon: 'M249 SAW / PKM / PKP Pecheneg',
    equipment: [
      '轻机枪',
      '大量弹药',
      '脚架（自动/手动）',
      '手榴弹',
    ],
    role: 'suppressive fire, area denial',
    tips: [
      '寻找高点或掩体位置部署机枪',
      '使用瞄准镜进行远程精确射击',
      '配合班长指示的火力方向进行压制',
      '注意枪管过热，适时停火冷却',
    ],
  },
  {
    id: 'marksman',
    name: ' marksman',
    nameEn: 'Marksman',
    icon: <Target className="w-6 h-6" />,
    color: 'green',
    description:
      '精确射手，配备高精度半自动步枪。在中远距离提供精准打击能力，能够消灭敌方重要目标和高价值目标。',
    primaryWeapon: 'SKS / M14 EBR / ACOG 步枪',
    equipment: [
      '精确射手步枪',
      '高倍瞄准镜',
      '手榴弹',
      '望远镜（部分阵营）',
    ],
    role: 'precision engagement, recon',
    tips: [
      '保持与敌军的距离优势',
      '优先消灭敌方机枪手和医疗兵',
      '使用望远镜侦察并标记敌人',
      '移动时保持低姿态，避免暴露',
    ],
  },
  {
    id: 'at-specialist',
    name: '反坦克专家',
    nameEn: 'Anti-Tank Specialist',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'red',
    description:
      '专职对付敌方装甲载具的角色，配备反坦克导弹或火箭筒。在载具密集的地图上至关重要，是保护己方载具的关键力量。',
    primaryWeapon: '卡宾枪 / 冲锋枪',
    equipment: [
      '反坦克导弹发射器 (HAT/LAT)',
      '激光指示器（部分）',
      '手榴弹',
      '烟雾弹',
    ],
    role: 'anti-armor, vehicle destruction',
    tips: [
      '提前预判敌方载具行进路线',
      '从侧后方攻击载具薄弱部位',
      '与队友配合，一人指示一人射击',
      '使用烟雾弹掩护自己或队友撤退',
    ],
  },
];

const KitsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-black/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/10 border border-blue-400/30 mb-6">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">兵种系统</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Squad{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                兵种角色
              </span>{' '}
              指南
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
              了解每个兵种的职责、装备和战术要点。
              选择适合你的角色，成为团队不可或缺的一员！
            </p>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        {/* Overview */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Info />
            <span>兵种系统概述</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-900/10 to-transparent border border-amber-400/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                角色分配
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                每个小队由<strong className="text-white"> 9 名玩家</strong> 组成，
                包括 1 名班长和 8 名不同兵种的队员。合理的兵种搭配是获胜的关键。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-400/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                团队协作
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                不同兵种相互配合：医疗兵救人、工程师建点、机枪手压制、
                反坦克打装甲。没有无敌的个人，只有无敌的团队。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-green-900/10 to-transparent border border-green-400/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldPlus className="w-5 h-5 text-green-400" />
                灵活切换
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                根据战场形势和小队需求，可以在 respawn 点更换兵种。
                灵活调整阵容以应对不同的战术挑战。
              </p>
            </div>
          </div>
        </section>

        {/* Kit Cards */}
        {kitsData.map((kit) => (
          <section
            key={kit.id}
            className={`panel-shell rounded-[28px] border px-6 py-8 sm:px-8 hover:border-${kit.color}-400/30 transition-all`}
          >
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
              <div className={`p-2 rounded-lg bg-${kit.color}-400/10`}>{kit.icon}</div>
              <span>
                {kit.name} ({kit.nameEn})
              </span>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">角色定位</h3>
                  <p className="text-slate-300 leading-relaxed">{kit.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    主武器
                  </h4>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                    <span className="text-sm font-medium text-amber-300">{kit.primaryWeapon}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <ShieldPlus className="w-4 h-4 text-amber-400" />
                    标准装备
                  </h4>
                  <ul className="space-y-2">
                    {kit.equipment.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Tips */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    战术技巧
                  </h4>
                  <ul className="space-y-3">
                    {kit.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-amber-400/10"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 text-xs flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-slate-300 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-900/20 to-orange-900/10 border border-amber-400/20">
                  <p className="text-xs text-slate-400 italic">
                    💡 <strong className="text-amber-300">FY 社区提示：</strong> 新手推荐从{' '}
                    <strong className="text-white">步枪手</strong> 或{' '}
                    <strong className="text-white">医疗兵</strong> 开始，
                    这两个角色容易上手且对小队贡献大！
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Team Composition Guide */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Users className="w-5 h-5" />
            <span>推荐小队配置</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-sm font-semibold text-amber-300 uppercase tracking-wider">
                    配置类型
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-amber-300 uppercase tracking-wider">
                    推荐组合
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-amber-300 uppercase tracking-wider hidden md:table-cell">
                    适用场景
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    type: '标准进攻队',
                    kits: '班长 + 2步枪手 + 2医疗兵 + 工程师 + 机枪手 + 精确射手 + 反坦克',
                    scene: '通用配置，平衡攻防能力',
                  },
                  {
                    type: '载具反制队',
                    kits: '班长 + 2反坦克专家 + 2医疗兵 + 2步枪手 + 机枪手 + 工程师',
                    scene: '敌方载具较多的地图',
                  },
                  {
                    type: '阵地防御队',
                    kits: '班长 + 2机枪手 + 2工程师 + 2医疗兵 + 2步枪手',
                    scene: '防守控制点和建造工事',
                  },
                  {
                    type: '快速反应队',
                    kits: '班长 + 4步枪手 + 2医疗兵 + 精确射手 + 工程师',
                    scene: '需要快速机动和占领点位',
                  },
                ].map((config, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium text-white">{config.type}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">{config.kits}</td>
                    <td className="py-4 px-4 text-sm text-slate-400 hidden md:table-cell">
                      {config.scene}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-900/10 border border-blue-400/20">
            <p className="text-sm text-slate-300">
              <strong className="text-blue-300">💡 提示：</strong> 以上配置仅供参考，
              实际游戏中应根据地图特点、敌方态势和战术需要灵活调整。
              与班长沟通，选择最适合当前局势的兵种！
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KitsPage;
