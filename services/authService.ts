// services/authService.ts
import { fetch } from 'react-native-ssl-pinning';
import { Platform } from 'react-native';
import { certsSha256, ReqTimeOutInt } from '../constants/config';
import { API_KEY } from '@env'; // Import from environment variables

const urlBaseProd = "https://webapp.ntpc.co.in/nqweldapi/api/";
const urlValidateUser = urlBaseProd + "Auth/ValidateUserV2";
const urlValidateOtp = urlBaseProd + "Auth/ValidateOTP";

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
        console.log('Validating user:', username);
        console.log('With captcha token:', captchaToken);

        const fetchOptions: any = {
            method: 'POST',
            timeoutInterval: ReqTimeOutInt,
            headers: {
                'XAPIKEY': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userLoginId: username,
                captchaToken: captchaToken
            })
        };

        console.log('Request body:', fetchOptions.body);

        // Add SSL pinning only for Android
        if (Platform.OS === 'android') {
            fetchOptions.pkPinning = true;
            fetchOptions.sslPinning = {
                certs: certsSha256,
            };
        } else {
            // Disable SSL pinning for iOS
            fetchOptions.disableAllSecurity = true;
        }

        const response = await fetch(urlValidateUser, fetchOptions);
        console.log('Response status:', response.status);

        if (response.status === 401) {
            return {
                statusCode: 401,
                statusDescShort: 'Session expired',
                statusDescLong: 'Your session token expired. Please try again.'
            };
        }

        if (response.status !== 200) {
            return {
                statusCode: response.status,
                statusDescShort: 'Error',
                statusDescLong: 'Something went wrong. Please try again.'
            };
        }

        const jsonResponse = await response.json();
        console.log('API Response:', JSON.stringify(jsonResponse));

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
    otp: string,
    tokenString: string
): Promise<ValidateOtpResponse> => {
    try {
        console.log('Validating OTP for user:', username);
        console.log('Token string:', tokenString);

        const fetchOptions: any = {
            method: 'POST',
            timeoutInterval: ReqTimeOutInt,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: username,
                password: otp,
                tokenString: tokenString
            })
        };

        console.log('OTP Request body:', fetchOptions.body);

        // Add SSL pinning only for Android
        if (Platform.OS === 'android') {
            fetchOptions.pkPinning = true;
            fetchOptions.sslPinning = {
                certs: certsSha256,
            };
        } else {
            // Disable SSL pinning for iOS
            fetchOptions.disableAllSecurity = true;
        }

        const response = await fetch(urlValidateOtp, fetchOptions);
        console.log('OTP Response status:', response.status);

        if (response.status === 401) {
            return {
                statusCode: 401,
                statusDescShort: 'Session expired',
                statusDescLong: 'Your session token expired. Please try again.'
            };
        }

        if (response.status !== 200) {
            return {
                statusCode: response.status,
                statusDescShort: 'Error',
                statusDescLong: 'Something went wrong. Please try again.'
            };
        }

        const jsonResponse = await response.json();
        console.log('OTP API Response:', JSON.stringify(jsonResponse));

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