import { Button, Space, TableProps } from 'antd';
import dayjs from 'dayjs';

import { IBannerAdvertisingItem } from './index';

const getColumns = (
  handleEdit: (record: IBannerAdvertisingItem) => void,
  handleDelete: (id: string) => void,
) => {
  const columns: TableProps<IBannerAdvertisingItem>['columns'] = [
    {
      title: 'adsId',
      dataIndex: 'adsBannerId',
      width: '200px',
      key: 'adsBannerId',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Advertising name',
      dataIndex: 'text',
      key: 'text',
    },
    {
      title: 'link',
      dataIndex: 'clickLink',
      key: 'clickLink',
      render: (text) => (
        <a target="_blank" href={text} rel="noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'page',
      dataIndex: 'labels',
      width: '400px',
      key: 'labels',
      render: (text) => (
        <div>
          <Space size={[8, 16]} wrap>
            {text.map((item: string) => {
              return <span key={item}>{item}</span>;
            })}
          </Space>
        </div>
      ),
    },
    {
      title: 'Impressions',
      dataIndex: 'totalVisitCount',
      key: 'totalVisitCount',
    },
    {
      title: 'createTime',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => <span>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              handleEdit(record);
            }}
          >
            edit
          </Button>
          <Button
            type="link"
            onClick={() => {
              handleDelete(record.adsBannerId);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return columns;
};

export default getColumns;
