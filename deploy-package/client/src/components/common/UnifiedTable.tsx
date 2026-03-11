import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Card, Button, Space, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Search } = Input;

interface UnifiedTableProps<T> extends Omit<TableProps<T>, 'title'> {
  fetchData: (params: { page: number; pageSize: number; search?: string; filters?: any }) => Promise<{
    items: T[];
    total: number;
  }>;
  columns: any[];
  headerTitle?: React.ReactNode;
  rowKey?: string;
  extraActions?: React.ReactNode;
}

const UnifiedTable = <T extends object>({ 
  fetchData, 
  columns, 
  headerTitle, 
  rowKey = 'id',
  extraActions,
  ...tableProps 
}: UnifiedTableProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');

  const loadData = useCallback(async (page = 1, pageSize = 20, search = '') => {
    setLoading(true);
    try {
      const res = await fetchData({ page, pageSize, search });
      // Ensure res is valid
      if (res && Array.isArray(res.items)) {
          setData(res.items);
          setPagination(prev => ({
            ...prev,
            current: page,
            pageSize,
            total: res.total || 0,
          }));
      } else {
          console.error('Invalid response format', res);
          setData([]);
      }
    } catch (error) {
      console.error('Failed to load data', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData(pagination.current, pagination.pageSize, searchText);
  }, [loadData, pagination.current, pagination.pageSize, searchText]);

  const handleTableChange: TableProps<T>['onChange'] = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 20,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-white">{headerTitle}</div>
        <Space>
          {extraActions}
          <Search
            placeholder="Search..."
            onSearch={handleSearch}
            style={{ width: 200 }}
            allowClear
            className="dark-search-input"
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => loadData(pagination.current, pagination.pageSize, searchText)}
          />
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }} className="bg-[#15171e] border-gray-800 overflow-hidden rounded-lg shadow-md">
        <Table
          rowKey={rowKey}
          columns={columns}
          dataSource={data}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            className: "px-4 py-2"
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          className="bg-transparent"
          locale={{ emptyText: <Empty description="No Data" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          {...tableProps}
        />
      </Card>
    </div>
  );
};

export default UnifiedTable;
