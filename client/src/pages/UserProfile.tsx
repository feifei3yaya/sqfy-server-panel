import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, message, 
  Select, Divider, List, Tag, Row, Col, Tabs, Modal, QRCode, Space, Typography
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  IdcardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getProfile, updateProfile, getLoginHistory, generate2FA, verify2FA } from '../api/user';
import { updateUser } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import UserAvatar from '../components/common/UserAvatar';

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [has2FA, setHas2FA] = useState(false);
  
  // 2FA Modal States
  const [is2FAModalVisible, setIs2FAModalVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  // Fetch profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const data = res.data;
      
      setHas2FA(!!data.has2FA);

      // Update form
      form.setFieldsValue({
        ...data,
        birthday: data.birthday ? dayjs(data.birthday) : null,
      });

      // Update Redux if needed
      dispatch(updateUser({
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        // Ensure other fields are updated if necessary
        id: data.id,
        username: data.username,
        role: data.role
      }));

      // Fetch login history
      fetchLoginHistory();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Don't show error message on initial load to avoid spamming if auth is shaky
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await getLoginHistory(1, 5);
      if (res.data && Array.isArray(res.data.data)) {
        setLoginHistory(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        birthday: values.birthday ? values.birthday.toISOString() : null,
      };
      const res = await updateProfile(payload);
      message.success('个人信息更新成功');
      
      // Update Redux
      dispatch(updateUser({
        nickname: res.data.nickname,
      }));
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await generate2FA();
      setQrCodeUrl(res.data.qrCode);
      setSecret(res.data.secret);
      setIs2FAModalVisible(true);
    } catch (error) {
      message.error('无法生成 2FA 密钥');
    }
  };

  const handleVerify2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      message.error('请输入6位验证码');
      return;
    }

    try {
      await verify2FA({ token: verifyCode, secret });
      message.success('双因素认证已启用');
      setIs2FAModalVisible(false);
      setVerifyCode('');
      setHas2FA(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || '验证失败');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Row gutter={[24, 24]}>
        {/* Left Column: Avatar & Summary */}
        <Col xs={24} md={8} lg={6}>
          <Card className="text-center shadow-sm border-amber-500/20 bg-[#0b0c10]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                 <UserAvatar 
                   size={120} 
                   src={user?.avatarUrl} 
                   name={user?.nickname || user?.username}
                   className="border-4 border-amber-500/30 transition-all"
                 />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-1">{user?.nickname || user?.username || 'User'}</h2>
              <Tag color="gold" className="mb-4">{user?.role === 'superadmin' ? '超级管理员' : '用户'}</Tag>
              
              <Divider className="border-gray-700 my-4" />
              
              <div className="w-full text-left space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>安全状态</span>
                  {has2FA ? <Tag color="success">已保护</Tag> : <Tag color="warning">未保护</Tag>}
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>上次登录</span>
                  <span className="text-gray-300 text-xs">
                    {loginHistory[0] ? dayjs(loginHistory[0].timestamp).format('MM-DD HH:mm') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column: Details */}
        <Col xs={24} md={16} lg={18}>
          <Card className="shadow-sm border-amber-500/20 bg-[#0b0c10]/80 backdrop-blur-sm" styles={{ body: { padding: 0 } }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              type="card"
              items={[
                {
                  key: 'basic',
                  label: <span className="px-4"><IdcardOutlined /> 基本资料</span>,
                  children: (
                    <div className="p-6">
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ gender: 'other', region: 'CN' }}
                      >
                        <Row gutter={24}>
                          <Col xs={24} md={12}>
                            <Form.Item label="昵称" name="nickname">
                              <Input className="bg-black/20 border-gray-700 text-white" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item label="Steam ID (用于绑定游戏管理权限)" name="steamId">
                              <Input className="bg-black/20 border-gray-700 text-white" placeholder="7656119xxxxxxxxxx" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item label="真实姓名" name="realname">
                              <Input className="bg-black/20 border-gray-700 text-white" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item label="性别" name="gender">
                              <Select
                                className="bg-transparent"
                                classNames={{ popup: { root: 'bg-[#1f1f1f]' } }}
                                options={[
                                  { value: 'male', label: '男' },
                                  { value: 'female', label: '女' },
                                  { value: 'other', label: '保密' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <div className="flex justify-end gap-4 mt-6">
                          <Button type="primary" htmlType="submit" loading={loading}>
                            保存修改
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )
                },
                {
                  key: 'security',
                  label: <span className="px-4"><SafetyCertificateOutlined /> 安全设置</span>,
                  children: (
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded border border-gray-700">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">双因素认证 (2FA)</h3>
                          <p className="text-gray-400 text-sm">
                            使用 Google Authenticator 或其他验证器应用保护您的账户。
                          </p>
                        </div>
                        <div>
                          {has2FA ? (
                            <Button disabled className="bg-green-900/20 text-green-500 border-green-900/50">
                              已启用
                            </Button>
                          ) : (
                            <Button type="primary" onClick={handleEnable2FA}>
                              启用 2FA
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-black/20 rounded border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">登录历史</h3>
                        <List
                          dataSource={loginHistory}
                          renderItem={(item: any) => (
                            <List.Item className="border-b border-gray-700/50 last:border-0 px-0">
                              <div className="flex justify-between w-full">
                                <Space>
                                  <Tag color={item.status === 'success' ? 'green' : 'red'}>
                                    {item.status.toUpperCase()}
                                  </Tag>
                                  <span className="text-gray-300">{item.ip}</span>
                                </Space>
                                <span className="text-gray-500 text-sm">
                                  {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                </span>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="启用双因素认证"
        open={is2FAModalVisible}
        onCancel={() => setIs2FAModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIs2FAModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleVerify2FA}>验证并启用</Button>,
        ]}
        className="dark"
      >
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-white p-2 rounded">
            <QRCode value={qrCodeUrl || 'loading'} size={200} />
          </div>
          
          <div className="text-center">
            <Typography.Text className="text-gray-300 block mb-2">1. 使用验证器应用扫描上方二维码</Typography.Text>
            <Typography.Text className="text-gray-300 block">2. 输入应用生成的6位验证码</Typography.Text>
          </div>

          <Input 
            placeholder="000000" 
            maxLength={6} 
            className="text-center text-2xl tracking-[0.5em] w-48 h-12"
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
