import React, { useCallback, useState } from 'react';
import { Tag, Button, Typography, Modal, Descriptions, Timeline, Card, Badge } from 'antd';
import { 
  EyeOutlined, 
  TrophyOutlined, 
  AimOutlined, 
  MedicineBoxOutlined, 
  CarOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import UnifiedTable from '../components/common/UnifiedTable';
import { getMatches, getMatchDetail } from '../api/match';
import type { Match } from '../api/match';
import dayjs from 'dayjs';

const { Title } = Typography;

interface GameEvent {
  id: string;
  type: 'KILL' | 'REVIVE' | 'VEHICLE_DESTROY' | string;
  data: any;
  timestamp: string;
}

const getEventIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'KILL':
      return <AimOutlined className="text-red-500" />;
    case 'REVIVE':
      return <MedicineBoxOutlined className="text-green-500" />;
    case 'VEHICLE_DESTROY':
      return <CarOutlined className="text-orange-500" />;
    default:
      return <ClockCircleOutlined className="text-blue-500" />;
  }
};

const getEventColor = (type: string) => {
  switch (type.toUpperCase()) {
    case 'KILL':
      return 'red';
    case 'REVIVE':
      return 'green';
    case 'VEHICLE_DESTROY':
      return 'orange';
    default:
      return 'blue';
  }
};

const formatEventContent = (event: GameEvent) => {
  const { type, data } = event;
  
  switch (type.toUpperCase()) {
    case 'KILL':
      if (typeof data === 'object' && data) {
        const killer = data.killer || 'Unknown';
        const victim = data.victim || 'Unknown';
        const weapon = data.weapon ? ` with ${data.weapon}` : '';
        return (
          <div>
            <span className="text-red-400 font-semibold">{killer}</span>
            <span className="text-gray-400 mx-1">→</span>
            <span className="text-gray-200">{victim}</span>
            {weapon && <span className="text-gray-500 text-sm ml-2">({weapon})</span>}
          </div>
        );
      }
      return `Kill: ${JSON.stringify(data)}`;
      
    case 'REVIVE':
      if (typeof data === 'object' && data) {
        const medic = data.medic || 'Unknown';
        const patient = data.patient || 'Unknown';
        return (
          <div>
            <span className="text-green-400 font-semibold">{medic}</span>
            <span className="text-gray-400 mx-1">revived</span>
            <span className="text-gray-200">{patient}</span>
          </div>
        );
      }
      return `Revive: ${JSON.stringify(data)}`;
      
    case 'VEHICLE_DESTROY':
      if (typeof data === 'object' && data) {
        const vehicle = data.vehicle || 'Unknown vehicle';
        const destroyer = data.destroyer ? `by ${data.destroyer}` : '';
        return (
          <div>
            <span className="text-orange-400 font-semibold">{vehicle}</span>
            <span className="text-gray-400"> destroyed</span>
            {destroyer && <span className="text-gray-200 ml-1">{destroyer}</span>}
          </div>
        );
      }
      return `Vehicle destroyed: ${JSON.stringify(data)}`;
      
    default:
      return <div className="text-gray-300">{type}: {typeof data === 'object' ? JSON.stringify(data) : data}</div>;
  }
};

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
      render: (count: number) => <Badge count={count || 0} showZero color="#1890ff" />,
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

            <Card title="Event Timeline" className="bg-[#1f1f1f] border-gray-700">
               {selectedMatch.events && selectedMatch.events.length > 0 ? (
                 <Timeline mode="left">
                   {selectedMatch.events.map((event: GameEvent) => (
                     <Timeline.Item 
                       key={event.id} 
                       label={dayjs(event.timestamp).format('HH:mm:ss')}
                       color={getEventColor(event.type)}
                       dot={getEventIcon(event.type)}
                     >
                       <div className="py-1">
                         <Tag color={getEventColor(event.type)} className="!mb-2 !text-xs">
                           {event.type}
                         </Tag>
                         {formatEventContent(event)}
                       </div>
                     </Timeline.Item>
                   ))}
                 </Timeline>
               ) : (
                 <div className="text-gray-500 text-center py-8">
                   <ClockCircleOutlined className="text-4xl mb-2 opacity-30" />
                   <div>No recorded events for this match</div>
                 </div>
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
