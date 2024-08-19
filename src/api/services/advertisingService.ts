import qs from 'qs';

import { IBannerAdvertisingItem } from '@/pages/banner-advertising';
import { IAdvertisingItem } from '@/pages/text-advertising';

import apiClient from '../apiClient';

export enum AdvertisingApi {
  TEXT_ADVERTISING = '/ads/list',
  BANNER_ADVERTISING = '/ads/banner/list',
  ADD_ADVERTISING = '/ads/detail',
  ADD_BANNER_ADVERTISING = '/ads/banner/detail',
}

const getTextAdvertisingList = (params?: { adsId?: string; labels?: string[] }) => {
  const query = !params ? null : qs.stringify(params, { arrayFormat: 'repeat' });
  return apiClient.get<{
    list: IAdvertisingItem[];
    total: number;
  }>({ url: `${AdvertisingApi.TEXT_ADVERTISING}?${query}` });
};

const addTextAdvertising = (data: Partial<IAdvertisingItem>) =>
  apiClient.post({ url: AdvertisingApi.ADD_ADVERTISING, data });

const delTextAdvertising = (params: { adsId: string }) =>
  apiClient.delete({ url: AdvertisingApi.ADD_ADVERTISING, params });

const getBannerAdvertisingList = (params?: { adsBannerId?: string; labels?: string[] }) => {
  const query = !params ? null : qs.stringify(params, { arrayFormat: 'repeat' });
  return apiClient.get<{
    list: IBannerAdvertisingItem[];
    total: number;
  }>({ url: `${AdvertisingApi.BANNER_ADVERTISING}?${query}` });
};

const addBannerAdvertising = (data: Partial<IBannerAdvertisingItem>) =>
  apiClient.post({ url: AdvertisingApi.ADD_BANNER_ADVERTISING, data });

const delBannerAdvertising = (params: { adsBannerId: string }) =>
  apiClient.delete({ url: AdvertisingApi.ADD_BANNER_ADVERTISING, params });

export default {
  getTextAdvertisingList,
  addTextAdvertising,
  delTextAdvertising,
  getBannerAdvertisingList,
  addBannerAdvertising,
  delBannerAdvertising,
};
