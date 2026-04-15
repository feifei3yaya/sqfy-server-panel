import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Input, DatePicker, Select, Button, message, Card } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import * as api from '../api/calendar';
import { getServers } from '../api/server';

const MatchCalendar: React.FC = () => {
  const [matches, setMatches] = useState<api.ScrimMatch[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [servers, setServers] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, serversRes] = await Promise.all([
        api.getMatches(),
        getServers()
      ]);
      setMatches(matchesRes.data);
      setServers(serversRes.data);
    } catch (error) {
      message.error('Failed to load calendar data');
    }
  };

  const getListData = (value: Dayjs) => {
    return matches.filter(m => dayjs(m.startTime).isSame(value, 'day'));
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (value, info) => {
    if (info.type !== 'date') {
      return info.originNode;
    }
    const listData = getListData(value);
    return (
      <ul className="list-none p-0 m-0">
        {listData.map((item) => (
          <li key={item.id} className="mb-1">
            <Badge status="success" text={item.title} className="text-xs" />
          </li>
        ))}
      </ul>
    );
  };

  const handleSelect = (value: Dayjs) => {
    setSelectedDate(value);
    // Open modal to add match? Or just view?
    // Let's show details or add button in a side panel
  };

  const handleAddMatch = () => {
    form.resetFields();
    form.setFieldsValue({ startTime: selectedDate });
    setIsModalVisible(true);
  };

  const handleCreate = async (values: any) => {
    try {
      await api.createMatch(values);
      message.success('Match created');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to create match');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-[#1f1f1f] rounded-lg p-4 border border-[#2d3139] overflow-y-auto">
        <Calendar 
          cellRender={cellRender} 
          onSelect={handleSelect}
          className="bg-transparent text-white"
        />
      </div>
      
      <div className="w-full md:w-80 flex flex-col gap-4">
        <Card title={selectedDate.format('YYYY-MM-DD')} className="bg-[#1f1f1f] border-gray-800">
          <Button type="primary" block onClick={handleAddMatch} className="mb-4">
            Schedule Match
          </Button>
          
          <div className="space-y-2">
            {getListData(selectedDate).map(match => (
              <Card key={match.id} size="small" className="bg-[#15171e] border-gray-700">
                <div className="font-bold text-amber-500">{match.title}</div>
                <div className="text-xs text-gray-400">
                  {dayjs(match.startTime).format('HH:mm')}
                  {match.endTime && ` - ${dayjs(match.endTime).format('HH:mm')}`}
                </div>
                {match.description && <div className="text-sm mt-1">{match.description}</div>}
              </Card>
            ))}
            {getListData(selectedDate).length === 0 && (
              <div className="text-gray-500 text-center py-4">No matches scheduled</div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        title="Schedule Match"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="dark"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="endTime" label="End Time">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="serverId" label="Server">
            <Select options={servers.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Create</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchCalendar;
