import React, { useCallback, useState } from 'react';
import { Tag, Button, Typography, Modal, Descriptions, Timeline, Card } from 'antd';
import { EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import UnifiedTable from '../components/common/UnifiedTable';
import { getMatches, getMatchDetail } from '../api/match';
import type { Match } from '../api/match';
import dayjs from 'dayjs';

const { Title } = Typography;

const MatchList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loadingDetail, setLoadingDetail] = useState(false);

  const handleViewDetails = async (id: string) => {
    setLoadingDetail(true);
    setIsModalVisible(true);
    try {
      const res = await getMatchDetail(id);
      setSelectedMatch(res.data.data);
    } catch (error) {
      console.error('Failed to load match detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const columns = [
    {
      title: 'Server',
      dataIndex: ['server', 'name'],
      key: 'server',
      render: (text: string) => <span className="text-gray-300 font-bold">{text || 'Unknown'}</span>,
    },
    {
      title: 'Map',
      dataIndex: 'map',
      key: 'map',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: Match) => {
        if (!record.endTime) return <Tag color="green">Live</Tag>;
        const diff = dayjs(record.endTime).diff(dayjs(record.startTime), 'minute');
        return `${diff} min`;
      },
    },
    {
      title: 'Winner',
      dataIndex: 'winner',
      key: 'winner',
      render: (text: string) => text ? <Tag color="gold">{text}</Tag> : '-',
    },
    {
      title: 'Events',
      dataIndex: ['_count', 'events'],
      key: 'events',
      render: (count: number) => count || 0,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Match) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small" 
          type="text" 
          className="text-amber-500"
          onClick={() => handleViewDetails(record.id)}
        >
          Details
        </Button>
      ),
    },
  ];

  const fetchData = useCallback(async (params: any) => {
    const res = await getMatches(params);
    return res.data.data?.items || res.data.data || []; 
  }, []);

  return (
    <div className="p-6">
      <UnifiedTable
        headerTitle={<Title level={3} className="!text-white !mb-0">Match History</Title>}
        fetchData={fetchData}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title="Match Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        className="dark"
      >
        {selectedMatch ? (
          <div className="space-y-6">
            <Card className="bg-[#1f1f1f] border-gray-700">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Server">{selectedMatch.server?.name}</Descriptions.Item>
                <Descriptions.Item label="Map">{selectedMatch.map}</Descriptions.Item>
                <Descriptions.Item label="Start Time">{dayjs(selectedMatch.startTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="End Time">{selectedMatch.endTime ? dayjs(selectedMatch.endTime).format('YYYY-MM-DD HH:mm:ss') : 'In Progress'}</Descriptions.Item>
                <Descriptions.Item label="Winner">
                  {selectedMatch.winner ? <Tag color="gold" icon={<TrophyOutlined />}>{selectedMatch.winner}</Tag> : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedMatch.endTime 
                    ? `${dayjs(selectedMatch.endTime).diff(dayjs(selectedMatch.startTime), 'minute')} minutes`
                    : 'Live'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Event Timeline (Under Construction)" className="bg-[#1f1f1f] border-gray-700">
               {/* 
                  TODO: Implement GameEvent fetching logic for this match.
                  Currently the backend getMatchDetail returns events but we need to ensure they are populated.
                  Since we just started tracking match events properly, old matches won't have much.
               */}
               {selectedMatch.events && selectedMatch.events.length > 0 ? (
                 <Timeline mode="left">
                   {selectedMatch.events.map((event: any) => (
                     <Timeline.Item key={event.id} label={dayjs(event.timestamp).format('HH:mm:ss')}>
                       {event.type} - {event.data}
                     </Timeline.Item>
                   ))}
                 </Timeline>
               ) : (
                 <div className="text-gray-500 text-center py-4">No recorded events for this match</div>
               )}
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">Loading...</div>
        )}
      </Modal>
    </div>
  );
};

export default MatchList;
