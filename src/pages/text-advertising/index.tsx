import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  TableProps,
} from 'antd';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import dayjsPluginUTC from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { useCallback, useEffect, useState } from 'react';

import advertisingService from '@/api/services/advertisingService';
import { Upload } from '@/components/upload';
import { useAWSUploadService } from '@/hooks/useAWSUploadService';
import { advertisingCounts, advertisingLabels } from '@/utils/contant';

import getColumns from './columnConfig';

import { TableParams } from '#/entity';

dayjs.extend(dayjsPluginUTC);

const { Option } = Select;
const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 9 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const { confirm } = Modal;

export interface IAdvertisingItem {
  adsId: string;
  head: string;
  logo: string;
  adsText: string;
  clickText: string;
  clickLink: string;
  labels: Array<string>;
  createTime: string;
  updateTime: string;
  startTime: number;
  endTime: number;
  totalVisitCount: number;
  id: string;
}

export default function Page() {
  const [form] = Form.useForm();
  const [queryForm] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(true);

  const [data, setData] = useState<Array<IAdvertisingItem>>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const [adsId, setAdsId] = useState<string>('');

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const queryData = queryForm.getFieldsValue();
    try {
      const data = await advertisingService.getTextAdvertisingList({
        labels: queryData.labels || undefined,
        adsId: queryData.adsId || undefined,
      });
      setData(data.list);
      setTableParams({
        pagination: {
          current: 1,
          pageSize: tableParams.pagination?.pageSize,
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [queryForm, tableParams.pagination?.pageSize]);

  const showModal = () => {
    setAdsId('');
    form.resetFields();
    setOpen(true);
  };

  const [open, setOpen] = useState(false);

  const { awsUploadFile } = useAWSUploadService();
  const onFinish = async (values: any) => {
    setConfirmLoading(true);
    const originLogo = values.logo[0];
    let logo = '';
    try {
      if (originLogo.url) {
        logo = originLogo.url;
      } else {
        const uploadFile = await awsUploadFile(originLogo.originFileObj as File);
        logo = uploadFile;
      }
    } catch (error) {
      message.error('aws upload error');
    }

    const startTime = dayjs(values.dateRange[0]).valueOf();
    const endTime = dayjs(values.dateRange[1]).valueOf();
    const data = {
      ...values,
      startTime,
      endTime,
      logo,
      adsId,
    };
    delete data.dateRange;
    try {
      await advertisingService.addTextAdvertising(data);
      if (!adsId) {
        message.success('add success');
      } else {
        message.success('edit success');
      }
      setOpen(false);
      setConfirmLoading(false);
      fetchData();
    } catch (error) {
      message.error('add error');
      setConfirmLoading(false);
    }
  };

  const handleOk = () => {
    form.submit();
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleSearchSet = () => {
    queryForm.resetFields();
    fetchData();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [messageApi, contextHolder] = message.useMessage();

  const handleEdit = async (params: IAdvertisingItem) => {
    setModelLoading(true);
    setOpen(true);
    const data = await advertisingService.getTextAdvertisingList({
      adsId: params.adsId,
    });
    setAdsId(params.adsId);
    const adsItem = data.list[0];
    const dateRange = adsItem.startTime ? [dayjs(adsItem.startTime), dayjs(adsItem.endTime)] : [];
    const regexFilename = /[^/]+$/;
    const matchFilename = adsItem.logo.match(regexFilename);
    const fullFilename = matchFilename ? matchFilename[0] : null;

    form.setFieldsValue({
      ...adsItem,
      dateRange,
      logo: adsItem.logo
        ? [
            {
              uid: '-1',
              name: fullFilename,
              status: 'done',
              url: adsItem.logo,
            },
          ]
        : [],
    });

    setModelLoading(false);
  };

  const handleTableChange: TableProps<IAdvertisingItem>['onChange'] = (pagination) => {
    setTableParams({
      pagination,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleDelete = (adsId: string) => {
    confirm({
      title: 'confirm',
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete this AD with AD id ${adsId} ?`,
      onOk() {
        return new Promise((resolve, reject) => {
          advertisingService
            .delTextAdvertising({ adsId })
            .then(() => {
              fetchData();
              resolve(true);
              messageApi.success('Delete successfully');
            })
            .catch((err) => {
              reject(err);
              messageApi.error(err?.message);
            });
        }).catch(() => console.log('Oops errors!'));
      },
      onCancel() {},
    });
  };

  const columns = getColumns(handleEdit, handleDelete);

  return (
    <div>
      {contextHolder}
      <Form layout="inline" form={queryForm} initialValues={{ layout: 'inline' }}>
        <Form.Item name="adsId" label="adsId">
          <Input style={{ width: '300px' }} allowClear placeholder="please input adsId" />
        </Form.Item>
        <Form.Item name="labels" label="labels">
          <Select
            style={{ width: '300px' }}
            mode="multiple"
            placeholder="Please select the pages"
            allowClear
          >
            {advertisingLabels.map((item) => {
              return (
                <Option key={item} value={item}>
                  {item}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              search
            </Button>
            <Button type="default" onClick={handleSearchSet}>
              reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Row className="mt-4">
        <Col span={24}>
          <Button type="primary" onClick={showModal}>
            add
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="adsId"
        size="small"
        loading={loading}
        pagination={{
          ...tableParams.pagination,
          position: ['topRight', 'bottomRight'],
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
        columns={columns}
        onChange={handleTableChange}
        dataSource={data}
        className="mt-4"
      />

      <Modal
        title="Title"
        open={open}
        width="800px"
        onOk={handleOk}
        loading={modelLoading}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form {...formItemLayout} form={form} style={{ maxWidth: 700 }} onFinish={onFinish}>
          <Form.Item
            label="Advertising name"
            name="head"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input
              count={{
                show: true,
                max: 15,
              }}
            />
          </Form.Item>
          <Form.Item
            label="describe"
            name="adsText"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input.TextArea
              count={{
                show: true,
                max: 80,
              }}
            />
          </Form.Item>
          <Form.Item
            label="buttonText"
            name="clickText"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input
              count={{
                show: true,
                max: 15,
              }}
            />
          </Form.Item>
          <Form.Item
            label="logo"
            name="logo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              return Array.isArray(e.fileList) ? e.fileList : [];
            }}
            rules={[{ required: true, message: 'Please upload logo!' }]}
          >
            <Upload accept="image/*" thumbnail={false} maxCount={1} name="single" />
          </Form.Item>
          <Form.Item
            label="link"
            name="clickLink"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="beginning and ending dates"
            name="dateRange"
            rules={[{ required: true, message: 'Please select!' }]}
          >
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="labels"
            label="pages"
            rules={[{ required: true, type: 'array', message: 'Please select one!' }]}
          >
            <Checkbox.Group>
              <Row gutter={8}>
                {advertisingLabels.map((item) => {
                  return (
                    <Col key={item} span={8}>
                      <Checkbox value={item} style={{ lineHeight: '32px' }}>
                        {item}
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            name="totalVisitCount"
            label="Impressions"
            rules={[{ required: true, message: 'Please select!' }]}
          >
            <Select
              style={{ width: '200px' }}
              placeholder="Please select the page labels"
              allowClear
            >
              {advertisingCounts.map((item) => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
