import React, { useMemo } from 'react';
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  ApiOutlined,
  RadarChartOutlined,
  MessageOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  CrownOutlined,
  UsergroupAddOutlined,
  HeartOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { Button, Card, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import LogoMark from '../components/LogoMark';
import TraeFooter from '../components/TraeFooter';
import ServerStatus from '../components/ServerStatus';
import EventCalendar from '../components/EventCalendar';
import { LOGIN_PATH, GUIDE_PATH, ABOUT_PATH, KITS_PATH, RULES_PATH } from '../routes';

const strengths = [
  {
    title: '稳定的社区节奏',
    description: '核心目标不是短期热闹，而是让玩家长期有服可打、有人可组、活动可跟。',
    icon: <DashboardOutlined />,
  },
  {
    title: '老带新友好',
    description: '保护好每一个萌新，团结起来每一个老玩家，让新人与老兵都能找到自己的位置。',
    icon: <RadarChartOutlined />,
  },
  {
    title: '管理透明',
    description: '重视规则执行、问题回应和秩序维护，尽量让每一次处理都清晰、有依据。',
    icon: <SafetyCertificateOutlined />,
  },
  {
    title: '活动驱动',
    description: '围绕夜战、训练、对抗与社区集结持续组织内容，不只是单纯开着一台服。',
    icon: <DeploymentUnitOutlined />,
  },
];

const quickStats = [
  { label: '品牌域名', value: 'sq-fy.cn' },
  { label: '社区定位', value: 'SQUAD 中文服' },
  { label: 'QQ群', value: '147724008' },
];

const communityHighlights = [
  '服务器介绍与开服理念',
  '社区规则与管理原则',
  '活动公告与本周安排',
  '新人入门、加入方式与赞助专区',
];

const joinSteps = [
  {
    title: '先了解服务器定位',
    description: '先看清楚【FY】肥鸭服务器的玩法氛围、管理风格，以及“保护萌新、团结老玩家”的社区理念。',
    icon: <GlobalOutlined />,
  },
  {
    title: '阅读社区规则',
    description: '提前了解指挥链、沟通方式和常见红线，避免第一次进服就踩坑。',
    icon: <ReadOutlined />,
  },
  {
    title: '关注活动与入服方式',
    description: '通过 QQ 群 147724008 获取活动时间、入服说明、群内通知与后续招募信息。',
    icon: <MessageOutlined />,
  },
];

const events = [
  {
    title: '固定夜战',
    detail: '围绕高峰时段组织集结，让玩家稳定找到车组、步班与队友。',
  },
  {
    title: '萌新教学',
    detail: '帮助新玩家快速理解报点、拉队、跟队和基础配合节奏。',
  },
  {
    title: '社区对抗',
    detail: '结合日常活动与节奏安排，逐步扩展到更完整的组织化玩法。',
  },
];

const faqs = [
  {
    question: '萌新能不能加入？',
    answer: '当然可以。FY 社区专门为萌新设计了友好的入门环境，有老玩家带队教学。',
  },
  {
    question: '这个社区更偏娱乐还是偏战术？',
    answer: '核心方向是战术协作，但会照顾不同水平玩家的参与体验。',
  },
  {
    question: '管理入口是给谁用的？',
    answer: '管理登录是后台入口，普通玩家主要看社区内容、规则、活动和入服信息。',
  },
  {
    question: '如何找到服务器？',
    answer:
      '在 Squad 游戏内服务器浏览器中搜索"FY"或"肥鸭"，或直接加入 QQ 群获取服务器名称。',
  },
  {
    question: '服务器平时几点有人？',
    answer:
      '周一到周四晚上 20:00 后开始有人，周五晚上和周末全天是高活跃时段。建议加入 QQ 群约队。',
  },
  {
    question: '被踢了/被封了怎么办？',
    answer:
      '请在 QQ 群内联系管理员，说明情况。管理员会根据记录进行处理和反馈。',
  },
  {
    question: '如何赞助服务器？',
    answer:
      '详见赞助专区。赞助资金用于服务器租赁、活动支持和网站维护。每笔赞助都会公示。',
  },
  {
    question: '服务器延迟高怎么办？',
    answer:
      '请检查网络连接，尝试关闭 VPN。如果持续高延迟，请在 QQ 群反馈，我们会排查服务器状态。',
  },
  {
    question: '可以申请管理员吗？',
    answer:
      '管理团队从活跃的老玩家中选拔。长期参与社区活动、愿意投入时间维护秩序的玩家有机会被邀请。',
  },
  {
    question: '服务器有哪些 Mod？',
    answer:
      '服务器会自动下载所需 Mod。加入服务器时如果提示缺少 Mod，按提示订阅即可。',
  },
];

const sponsorItems = [
  {
    title: '赞助专区',
    description: '集中展示赞助说明、用途方向与社区支持入口，方便统一管理与长期维护。',
  },
  {
    title: '赞助公示栏',
    description: '用于公开展示赞助名单、时间与对应说明，让每一份支持都能被清楚记录。',
  },
];

const audienceGroups = [
  {
    title: '适合刚入坑的萌新',
    description: '如果你想找一个愿意沟通、愿意解释基础玩法、不会因为失误就直接排斥你的环境，这里适合你。',
    icon: <HeartOutlined />,
  },
  {
    title: '适合愿意配合的老玩家',
    description: '如果你重视指挥链、报点、节奏和团队感，希望长期稳定开打，这里更容易留下固定队友。',
    icon: <UsergroupAddOutlined />,
  },
  {
    title: '适合长期参与社区的人',
    description: '如果你不想只打一把就散，希望认识固定玩家、关注活动与社区发展，这里更像一个长期阵地。',
    icon: <CrownOutlined />,
  },
];

const staffRoles = [
  {
    role: '服主 / 核心维护',
    detail: '负责服务器长期方向、运营节奏、规则调整和社区氛围把控。',
  },
  {
    role: '管理组',
    detail: '负责秩序维护、问题响应、规则执行与活动通知，尽量做到处理有依据、反馈可追踪。',
  },
  {
    role: '老玩家骨干',
    detail: '帮助新人融入社区、带队组队、维持日常对局体验，是社区稳定度的重要组成部分。',
  },
];

const sponsorBoard = [
  { slot: '公示位 01', note: '等待公示' },
  { slot: '公示位 02', note: '等待公示' },
  { slot: '公示位 03', note: '等待公示' },
];

const sponsorUsage = [
  '服务器租赁与基础运行开销',
  '活动支持与社区福利发放',
  '官网与后台相关功能持续维护',
];

const QQ_GROUP_URL = 'https://qm.qq.com/q/s4mZxx1eQ8';

const OfficialSite: React.FC = () => {
  const navigate = useNavigate();

  const hostName = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'sq-fy.cn';
    }
    return window.location.hostname || 'sq-fy.cn';
  }, []);

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#06070a] text-white"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#050608_0%,#0b0c10_42%,#111318_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_26%)]" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(251,191,36,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.9) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.18))',
        }}
      />
      <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel-shell flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark size="md" />
            <div>
              <div className="text-sm font-semibold tracking-[0.24em] text-amber-400">【FY】肥鸭服务器</div>
              <div className="text-xs text-slate-400">SQUAD 服务器社区网站</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" href="#about">
              关于社区
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" href="#events">
              活动
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" onClick={() => navigate(RULES_PATH)}>
              服务器规则
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" onClick={() => navigate(GUIDE_PATH)}>
              新手指南
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" onClick={() => navigate(ABOUT_PATH)}>
              关于Squad
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" onClick={() => navigate(KITS_PATH)}>
              兵种指南
            </Button>
            <Button type="text" className="!text-slate-200 hover:!text-amber-400" href="#join">
              加入方式
            </Button>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate(LOGIN_PATH)}
              className="!border-none !bg-amber-400 !font-semibold !text-black hover:!bg-amber-300"
            >
              管理登录
            </Button>
          </div>
        </header>

        <main className="flex-1 py-8 sm:py-12">
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="panel-shell rounded-[28px] border px-6 py-8 sm:px-8 sm:py-10">
              <Tag
                variant="filled"
                className="mb-5 rounded-full bg-amber-500/12 px-4 py-1 text-xs font-semibold tracking-[0.28em] !text-amber-300"
              >
                SQUAD COMMUNITY
              </Tag>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                【FY】肥鸭服务器
                <span className="block text-amber-400">稳定开打的中文 Squad 社区</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                这里不是单纯的一台服介绍页，而是【FY】肥鸭服务器的社区入口。我们希望把 Squad 的战术配合、
                固定活动、管理秩序与新人友好放在同一套社区体验里，让每一个想认真打游戏的人都知道为什么来、来了以后怎么玩。
              </p>
              <div className="mt-5 rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                <span className="font-semibold text-amber-300">社区理念：</span>
                保护好每一个萌新，团结起来每一个老玩家。
              </div>
              <div className="mt-8 flex flex-col gap-6">
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="large"
                    type="primary"
                    icon={<MessageOutlined />}
                    href={QQ_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!h-12 !border-none !bg-gradient-to-r !from-amber-400 !to-amber-500 !px-8 !font-semibold !text-black hover:!from-amber-300 hover:!to-amber-400 !shadow-lg hover:!shadow-amber-500/20 !transition-all !duration-300"
                  >
                    立即加入QQ群
                  </Button>
                  <Button
                    size="large"
                    icon={<ReadOutlined />}
                    href="#rules"
                    className="!h-12 !border-2 !border-amber-400/40 !bg-transparent !px-8 !text-amber-300 hover:!border-amber-400 hover:!bg-amber-400/10 !shadow-md hover:!shadow-amber-500/10 !transition-all !duration-300"
                  >
                    阅读服务器规则
                  </Button>
                </div>
                <ServerStatus />
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {quickStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <Card
                variant="borderless"
                className="panel-shell rounded-[28px] border border-amber-400/10 bg-transparent"
                styles={{ body: { padding: 28 } }}
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                  <ThunderboltOutlined />
                  社区速览
                </div>
                <div className="mt-5 space-y-4">
                  {communityHighlights.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                      <span className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
                        <CheckCircleOutlined />
                      </span>
                      <div className="flex-1 text-sm leading-7 text-slate-300">{item}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="panel-shell rounded-[28px] border px-6 py-6">
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                  <ApiOutlined />
                  社区入口
                </div>
                <div className="mt-4 text-xl font-bold text-white">加入群聊、看规则、等活动，是玩家最主要的入口</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  {hostName} 作为【FY】肥鸭服务器的社区官网存在，核心目标是先让玩家快速理解社区、顺利加入群聊、跟上活动节奏。管理后台保留为内部登录入口，不再单独作为首页重点展示。
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="mt-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-amber-400" />
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-amber-400">About FY</div>
                <div className="text-2xl font-bold text-white">为什么来【FY】肥鸭服务器</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {strengths.map((item) => (
                <Card
                  key={item.title}
                  variant="borderless"
                  className="panel-shell h-full rounded-[24px] border border-amber-400/10 bg-transparent"
                  styles={{ body: { padding: 24, height: '100%' } }}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-xl text-amber-300">
                      {item.icon}
                    </div>
                    <div className="mt-5 text-lg font-semibold text-white">{item.title}</div>
                    <div className="mt-3 flex-1 text-sm leading-7 text-slate-300">{item.description}</div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <GlobalOutlined />
                服务器介绍
              </div>
              <div className="mt-4 text-2xl font-bold text-white">这不是临时热闹，而是想长期打下去的 Squad 社区</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                【FY】肥鸭服务器希望同时照顾两类人：一类是刚进入 Squad、需要被保护和引导的萌新；另一类是愿意配合、愿意沟通、愿意和社区一起长期打下去的老玩家。我们希望通过稳定活动、清晰规则和持续维护，把这两类人真正连接起来。
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {audienceGroups.map((item) => (
                <div key={item.title} className="panel-shell rounded-[24px] border px-5 py-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-lg text-amber-300">
                    {item.icon}
                  </div>
                  <div className="mt-4 text-base font-semibold text-white">{item.title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{item.description}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="events" className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <ClockCircleOutlined />
                活动节奏
              </div>
              <div className="mt-4 text-2xl font-bold text-white">让玩家知道什么时候来，来了以后能打什么</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                好的社区首页不只告诉玩家“我们有一台服”，还要告诉玩家“这里平时怎么玩、活动时怎么玩、什么时候最容易找到队友”。
              </div>
              <div className="mt-6 space-y-4">
                {events.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                    <div className="flex items-center gap-2 text-base font-semibold text-white">
                      <FireOutlined className="text-amber-400" />
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id="join" className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <TeamOutlined />
                加入方式
              </div>
              <div className="mt-4 text-2xl font-bold text-white">第一次来到【FY】，按这 3 步开始</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                官网的目标不是让玩家先看到后台，而是让玩家最快知道如何加入社区、如何避免踩坑、如何进入第一场像样的 Squad 对局。
              </div>
              <div className="mt-4 rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">社区 QQ 群</div>
                <div className="mt-2 text-2xl font-bold tracking-[0.18em] text-white">147724008</div>
                <div className="mt-2 text-sm leading-7 text-slate-300">活动通知、入服说明、管理沟通与萌新指引统一在群内发布。</div>
                <div className="mt-4">
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    href={QQ_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!border-none !bg-amber-400 !font-semibold !text-black hover:!bg-amber-300"
                  >
                    打开QQ群邀请链接
                  </Button>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {joinSteps.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Step 0{index + 1}</div>
                        <div className="text-base font-semibold text-white">{item.title}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <EventCalendar />
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <TeamOutlined />
                管理团队
              </div>
              <div className="mt-4 space-y-4">
                {staffRoles.map((item) => (
                  <div key={item.role} className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                    <div className="text-base font-semibold text-white">{item.role}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="rules" className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <SafetyCertificateOutlined />
                社区规则
              </div>
              <div className="mt-4 text-2xl font-bold text-white">管理要有边界，规则要让玩家看得懂</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                  <span>重视战术沟通，尊重指挥链与队友体验</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                  <span>不欢迎辱骂、刷屏、恶意摆烂与破坏秩序</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                  <span>处理问题强调记录、依据与透明反馈</span>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  size="large"
                  icon={<ReadOutlined />}
                  onClick={() => navigate(RULES_PATH)}
                  className="!h-12 !border-amber-400/30 !bg-black/25 !px-6 !text-slate-100 hover:!border-amber-400 hover:!text-amber-300"
                >
                  查看完整服务器规则
                </Button>
              </div>
            </div>
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <NotificationOutlined />
                常见问题
              </div>
              <div className="mt-4 space-y-4">
                {faqs.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                    <div className="text-base font-semibold text-white">{item.question}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <CloudServerOutlined />
                社区承诺
              </div>
              <div className="mt-4 text-2xl font-bold text-white">让新玩家敢进来，让老玩家愿意留下来</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                服务器社区最重要的不是口号，而是氛围是否稳定、规则是否清楚、玩家之间能不能形成长期关系。FY 的核心方向就是保护每一个愿意学习的萌新，团结每一个愿意投入的老玩家。
              </div>
            </div>
            <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
                <NotificationOutlined />
                赞助专区
              </div>
              <div className="mt-4 space-y-4">
                {sponsorItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                    <div className="text-base font-semibold text-white">{item.title}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{item.description}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-amber-300">
                  <FundOutlined />
                  赞助用途方向
                </div>
                <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  {sponsorUsage.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4">
                <div className="text-sm uppercase tracking-[0.24em] text-amber-300">赞助公示栏</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {sponsorBoard.map((item) => (
                    <div key={item.slot} className="rounded-2xl border border-white/6 bg-[#0f1115] px-4 py-4 text-center">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.slot}</div>
                      <div className="mt-2 text-sm font-semibold text-white">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </main>

        <TraeFooter variant="site" />
      </div>
    </div>
  );
};

export default OfficialSite;
