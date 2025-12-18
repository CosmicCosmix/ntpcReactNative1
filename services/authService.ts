import axios from 'axios';

const urlBaseProd = "https://webapp.ntpc.co.in/nqweldapi/api/";
const urlValidateUser = urlBaseProd + "Auth/ValidateUserV2";
const urlValidateOtp = urlBaseProd + "Auth/ValidateOTP";

export interface ValidateUserResponse {
    statusCode: number;
    message?: string;
    data?: any;
}

export interface ValidateOtpResponse {
    statusCode: number;
    message?: string;
    token?: string;
    data?: any;
}

export const validateUser = async (username: string): Promise<ValidateUserResponse> => {
    try {
        const response = await axios.post(urlValidateUser, {
            username: username
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return error.response.data;
        }
        throw new Error('Network error occurred');
    }
};

export const validateOtp = async (username: string, otp: string): Promise<ValidateOtpResponse> => {
    try {
        const response = await axios.post(urlValidateOtp, {
            username: username,
            otp: otp
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return error.response.data;
        }
        throw new Error('Network error occurred');
    }
};
