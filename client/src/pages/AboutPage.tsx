import React from 'react';
import {
  Gamepad2,
  Users,
  Target,
  MapPin,
  Shield,
  Radio,
  Zap,
  Heart,
  Star,
  Trophy,
  MessageCircle,
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-black/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 mb-6">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">关于战术小队</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              什么是{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Squad（战术小队）
              </span>
              ？
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
              一款强调团队协作、战术沟通与真实战场体验的军事模拟第一人称射击游戏。
              在 FY 社区，我们致力于为中文玩家打造最专业、最友好的 Squad 游戏环境。
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* What is Squad */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Gamepad2 />
            <span>游戏概述</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">战术小队 (Squad)</h2>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">Squad</strong> 是由{' '}
                <strong className="text-amber-300">Offworld Industries</strong>{' '}
                开发的一款在线多人军事射击游戏，在 Steam 平台发售。
                游戏通过 Kickstarter 众筹项目获得资金支持。
              </p>
              <p className="text-slate-300 leading-relaxed">
                在 Squad 中，<strong className="text-white">多达 100 名玩家</strong>{' '}
                分为两个对立阵营，在大型开放地图上进行战术对抗。
                团队合作与沟通是获胜的关键。
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">100 人对战</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">大型开放地图</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">实时语音通讯</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                核心特色
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    icon: Target,
                    title: '真实弹道系统',
                    desc: '子弹受重力影响下坠，需预判目标位置',
                  },
                  {
                    icon: Shield,
                    title: '前哨建造系统',
                    desc: '建造防御工事、补给站、 respawn 点',
                  },
                  {
                    icon: Radio,
                    title: '层级指挥体系',
                    desc: '班长 → 小队长 → 指挥官的链式指挥',
                  },
                  {
                    icon: Zap,
                    title: '多样化兵种',
                    desc: '医疗、工程、重机枪等不同角色',
                  },
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-amber-400/10">
                    <feature.icon className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">{feature.title}</div>
                      <div className="text-sm text-slate-400 mt-1">{feature.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FY Community Section */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Heart className="w-5 h-5 text-red-400" />
            <span>FY 社区定位</span>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-amber-900/10 to-transparent border border-amber-400/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-400/10 mb-4">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">保护萌新</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                我们理解每个高手都曾是萌新。社区提供耐心指导，
                不歧视新手，帮助每位玩家快速成长。
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-400/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-400/10 mb-4">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">团结老玩家</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                打造稳定的常驻玩家群体，形成默契的团队配合，
                让每次游戏都充满乐趣和挑战。
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-green-900/10 to-transparent border border-green-400/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-400/10 mb-4">
                <Trophy className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">稳定开打</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                服务器 24 小时运行，定期组织训练和活动，
                保证随时都有人可以一起游戏。
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-black/30 border border-amber-400/20">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-2">加入我们的 QQ 群</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  无论你是刚入坑的萌新，还是经验丰富的老兵，FY 社区都欢迎你的加入！
                  我们在这里等你一起战斗！
                </p>
                <a
                  href="https://qm.qq.com/q/s4mZxx1eQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  加入 QQ 群 147724008
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Game Modes */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Target />
            <span>游戏模式</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'AAS (进攻与防守)',
                desc: '争夺地图上的控制点，占领多数据点即可获胜',
                icon: MapPin,
                color: 'red',
              },
              {
                name: 'RAAS (随机 AAS)',
                desc: 'AAS 的变体，控制点顺序随机生成，增加不确定性',
                icon: Zap,
                color: 'orange',
              },
              {
                name: 'Insurgency (叛乱)',
                desc: '进攻方需要摧毁敌方武器库，防守方保护目标',
                icon: Shield,
                color: 'purple',
              },
              {
                name: 'Skirmish (遭遇战)',
                desc: '小规模冲突模式，适合快速游戏和训练',
                icon: Gamepad2,
                color: 'blue',
              },
              {
                name: 'Invasion (入侵)',
                desc: '一方进攻另一方防守的非对称模式',
                icon: Target,
                color: 'green',
              },
              {
                name: 'TC (坦克战争)',
                desc: '以载具为主的战斗模式，考验载具配合能力',
                icon: Shield,
                color: 'yellow',
              },
            ].map((mode, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border border-amber-400/10 bg-black/20 hover:border-amber-400/30 hover:bg-black/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${mode.color}-400/10 group-hover:bg-${mode.color}-400/20 transition-colors`}>
                    <mode.icon className={`w-5 h-5 text-${mode.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {mode.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Community Culture */}
        <section className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400 mb-6">
            <Star />
            <span>社区文化</span>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  💬 沟通优先
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>使用麦克风进行实时语音沟通</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>听从班长和小队的战术指令</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>积极汇报敌情和战场态势</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>保持冷静，避免不必要的争吵</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🤝 团队协作
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>Squad 不是单人英雄游戏，团队至上</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>互相支援，不要孤军深入</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>尊重每一位队友的贡献</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5">•</span>
                    <span>胜利属于整个团队，而非个人</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-900/20 via-orange-900/10 to-red-900/20 border border-amber-400/20">
              <blockquote className="text-center">
                <p className="text-lg italic text-slate-200 mb-4">
                  "在 FY 社区，我们不追求个人数据的华丽，而是追求团队的默契与胜利的喜悦。
                  每一场游戏都是一次学习的机会，每一次失败都是成长的阶梯。"
                </p>
                <footer className="text-amber-300 font-semibold">— FY 社区理念</footer>
              </blockquote>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
