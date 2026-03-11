import * as tencentcloud from "tencentcloud-sdk-nodejs";
import { ClientConfig } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";

const SmsClient = tencentcloud.sms.v20210111.Client;

interface SendSmsParams {
  phoneNumber: string;
  templateId?: string;
  templateParams: string[];
  signName?: string;
}

class SmsService {
  private client: InstanceType<typeof SmsClient> | null = null;
  private secretId: string = "";
  private secretKey: string = "";
  private appId: string = "";
  private defaultSignName: string = "";
  private defaultTemplateId: string = "";

  constructor() {
    this.initialize();
  }

  async initialize() {
    this.secretId = process.env.TENCENT_SECRET_ID || "";
    this.secretKey = process.env.TENCENT_SECRET_KEY || "";
    this.appId = process.env.TENCENT_SMS_APP_ID || "";
    this.defaultSignName = process.env.SMS_SIGN_NAME || "";
    this.defaultTemplateId = process.env.SMS_TEMPLATE_ID || "";

    if (this.secretId && this.secretKey) {
      const clientConfig: ClientConfig = {
        credential: {
          secretId: this.secretId,
          secretKey: this.secretKey,
        },
        region: "ap-guangzhou",
        profile: {
          httpProfile: {
            endpoint: "sms.tencentcloudapi.com",
          },
        },
      };
      this.client = new SmsClient(clientConfig);
    }
  }

  async sendSms({ phoneNumber, templateId, templateParams, signName }: SendSmsParams) {
    if (!this.client || !this.appId) {
      await this.initialize();
    }

    if (!this.client || !this.appId) {
      console.warn("Tencent Cloud credentials or App ID not configured");
      return { error: "Credentials or App ID missing" };
    }

    const params = {
      PhoneNumberSet: [`+86${phoneNumber}`],
      SmsSdkAppId: this.appId,
      TemplateId: templateId || this.defaultTemplateId,
      SignName: signName || this.defaultSignName,
      TemplateParamSet: templateParams,
    };

    if (!params.TemplateId || !params.SignName) {
       return { error: "Template ID or Sign Name missing" };
    }

    try {
      const result = await this.client.SendSms(params);
      return result;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      throw error;
    }
  }
}

export const smsService = new SmsService();
