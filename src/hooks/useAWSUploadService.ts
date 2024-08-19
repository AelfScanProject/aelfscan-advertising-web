import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { useCallback, useMemo } from 'react';

export interface IUploadService {
  bucket: string;
  identityPoolId: string;
}

export function useAWSUploadService() {
  const serviceForm = {
    bucket: 'aelfscan-mainnet',
    identityPoolId: 'ap-northeast-1:bf43d3d0-4590-4a18-b9ed-8d6a4fb240ed',
  };
  const REGION = 'ap-northeast-1';

  const s3Client = useMemo(
    () =>
      new S3Client({
        region: REGION,
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({
            region: REGION,
          }),
          identityPoolId: serviceForm.identityPoolId,
        }),
      }),
    [serviceForm.identityPoolId],
  );

  const awsUploadFile = useCallback(
    async (file: File) => {
      const FileKey = `${Date.now()}-${file.name}`;
      const params = {
        ACL: ObjectCannedACL.public_read,
        Bucket: serviceForm.bucket,
        Key: FileKey,
      };
      try {
        const res = await s3Client.send(
          new PutObjectCommand({
            Body: file,
            ContentType: file.type,
            ContentLength: file.size,
            ...params,
          }),
        );
        console.log('=====uploadFile success:', res);
        return `https://${serviceForm.bucket}.s3.${REGION}.amazonaws.com/${encodeURIComponent(
          FileKey,
        )}`;
      } catch (error) {
        console.error('=====awsUploadFile error:', error);
        return Promise.reject(error);
      }
    },
    [s3Client, serviceForm.bucket],
  );

  return {
    awsUploadFile,
  };
}
