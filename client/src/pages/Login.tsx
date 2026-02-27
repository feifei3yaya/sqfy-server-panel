import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { loginSuccess } from '../store/authSlice';
import LogoMark from '../components/LogoMark';
import TraeFooter from '../components/TraeFooter';

const { Title } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      
      if (response.data.require2FA) {
        setRequires2FA(true);
        message.info('请输入双因素认证码');
        setLoading(false);
        return;
      }

      dispatch(loginSuccess(response.data));
      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#0b0c10] bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: 'url(/bg.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full z-20">
        <TraeFooter />
      </div>
      
      {/* Compact Horizontal Modal */}
      <div className="relative z-10 w-full max-w-[700px] px-4">
        <Card 
          className="shadow-2xl border-amber-500/20 backdrop-blur-md overflow-hidden"
          style={{ backgroundColor: 'rgba(15, 17, 21, 0.4)' }}
          bodyStyle={{ padding: 0 }}
        >
          <div className="flex flex-col md:flex-row h-full md:h-[380px]">
            {/* Left Side: Brand Visual (Width ~40%) */}
            <div className="md:w-[280px] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-amber-500/10 relative">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 mb-6 transform hover:scale-105 transition-transform duration-500">
                <LogoMark size="xl" />
              </div>
              
              <div className="text-center relative z-10">
                <h1 className="text-xl font-extrabold text-white tracking-widest leading-tight drop-shadow-md">
                  战术小队
                </h1>
                <p className="text-[10px] text-amber-500 font-bold tracking-[0.3em] uppercase mt-1 opacity-90 drop-shadow-sm">
                  服务器管理系统
                </p>
              </div>
            </div>

            {/* Right Side: Login Form (Width ~60%) */}
            <div className="flex-1 p-8 flex flex-col justify-center bg-transparent">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5 drop-shadow-md">
                  <span className="w-1 h-4 bg-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                  管理员登录
                </h2>
              </div>

              <Form
                form={form}
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="middle"
                requiredMark="optional"
                className="space-y-4"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                  className="mb-0"
                >
                  <Input 
                    prefix={<UserOutlined className="text-amber-500/80 mr-2.5" />} 
                    placeholder="用户名" 
                    className="!bg-black/20 !border-white/10 !text-white placeholder:!text-gray-400 hover:!border-amber-500/40 focus:!border-amber-500 h-10 rounded-sm transition-colors text-sm backdrop-blur-sm"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                  className="mb-1"
                >
                  <Input.Password 
                    prefix={<LockOutlined className="text-amber-500/80 mr-2.5" />} 
                    placeholder="密码" 
                    className="!bg-black/20 !border-white/10 !text-white placeholder:!text-gray-400 hover:!border-amber-500/40 focus:!border-amber-500 h-10 rounded-sm transition-colors text-sm backdrop-blur-sm"
                  />
                </Form.Item>

                {requires2FA && (
                  <Form.Item
                    name="code"
                    rules={[{ required: true, message: '请输入验证码' }]}
                    className="mb-1"
                  >
                    <Input 
                      prefix={<GoogleOutlined className="text-amber-500/80 mr-2.5" />} 
                      placeholder="双因素验证码" 
                      className="!bg-black/20 !border-white/10 !text-white placeholder:!text-gray-400 hover:!border-amber-500/40 focus:!border-amber-500 h-10 rounded-sm transition-colors tracking-widest text-center text-sm backdrop-blur-sm"
                      maxLength={6}
                    />
                  </Form.Item>
                )}

                <Form.Item className="mb-0 pt-3">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading} 
                    className="h-10 bg-amber-600/90 hover:!bg-amber-500 border-none text-black font-extrabold tracking-[0.2em] text-sm shadow-lg shadow-amber-900/30 rounded-sm transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                  >
                    登 录
                  </Button>
                </Form.Item>
              </Form>

              <div className="mt-4 text-center select-none opacity-50 hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-amber-500/80 font-mono tracking-wider">
                   ⚠ 本面板仅为内部使用
                </span>
              </div>
            </div>
          </div>
        </Card>
        

      </div>
    </div>
  );
};

export default Login;
