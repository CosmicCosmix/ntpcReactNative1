// services/authService.ts
import { fetch } from 'react-native-ssl-pinning';
import { certsSha256, ReqTimeOutInt } from '../constants/config';
const urlBaseProd = "https://webapp.ntpc.co.in/nqweldapi/api/";
const urlValidateUser = urlBaseProd + "Auth/ValidateUserV2";
const urlValidateOtp = urlBaseProd + "Auth/ValidateOTP";
const API_KEY = "111112D300E4F5G60099";
export interface ValidateUserResponse {
    statusCode: number;
    statusDescShort?: string;
    statusDescLong?: string;
    data?: any;
    userid?: string;
    tokenString?: string;
}
export interface ValidateOtpResponse {
    statusCode: number;
    statusDescShort?: string;
    statusDescLong?: string;
    data?: any;
    tokenString?: string;
}
export const validateUser = async (
    username: string,
    captchaToken: string
): Promise<ValidateUserResponse> => {
    try {
        const response = await fetch(urlValidateUser, {
            method: 'POST',
            timeoutInterval: ReqTimeOutInt,
            sslPinning: {
                certs: certsSha256,
            },
            headers: {
                'XApiKey': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                UserLoginId: username,
                CaptchaToken: captchaToken
            })
        });
        const jsonResponse = await response.json();
        // Return with proper type
        return {
            statusCode: jsonResponse.statusCode || 0,
            statusDescShort: jsonResponse.statusDescShort,
            statusDescLong: jsonResponse.statusDescLong,
            data: jsonResponse.data,
            userid: jsonResponse.userid,
            tokenString: jsonResponse.tokenString
        };
    } catch (error: any) {
        console.error('Validate User Error:', error);
        // Return error response with statusCode
        return {
            statusCode: 0,
            statusDescShort: 'Error',
            statusDescLong: error.message || 'Network error occurred'
        };
    }
};
export const validateOtp = async (
    username: string,
    otp: string
): Promise<ValidateOtpResponse> => {
    try {
        const response = await fetch(urlValidateOtp, {
            method: 'POST',
            timeoutInterval: ReqTimeOutInt,
            sslPinning: {
                certs: certsSha256,
            },
            headers: {
                'XApiKey': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                UserLoginId: username,
                otp: otp
            })
        });
        const jsonResponse = await response.json();
        // Return with proper type
        return {
            statusCode: jsonResponse.statusCode || 0,
            statusDescShort: jsonResponse.statusDescShort,
            statusDescLong: jsonResponse.statusDescLong,
            data: jsonResponse.data,
            tokenString: jsonResponse.tokenString
        };
    } catch (error: any) {
        console.error('Validate OTP Error:', error);
        // Return error response with statusCode
        return {
            statusCode: 0,
            statusDescShort: 'Error',
            statusDescLong: error.message || 'Network error occurred'
        };
    }
};