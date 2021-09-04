import qs from "qs";
import {ApiResponse, HTTPMethod, IApiStore, RequestParams, StatusHTTP} from "./types";

export default class ApiStore implements IApiStore {
    readonly baseUrl: string;

    constructor(baseUrl: string) {
        // TODO: Примите из параметров конструктора baseUrl
        // и присвойте его в this.baseUrl
        this.baseUrl = baseUrl;
    }

    private getRequestData<ReqT>(params: RequestParams<ReqT>): [string, RequestInit] {
        let finalUrl = this.baseUrl + params.endpoint;

        const req: RequestInit = {
            method: params.method,
            // headers: {...params.headers},  //так закинется только первый уровень вложенности
            headers: params.headers,
        }

        if (params.method === HTTPMethod.GET) {
            finalUrl += `?${qs.stringify(params.data)}`
        }

        if (params.method === HTTPMethod.POST) {
            req.body = JSON.stringify(params.data);
            req.headers = {
                ...req.headers,
                'Content-Type': 'application/json;charset=UTF-8',
            };
        }

        return [finalUrl, req];
    }

    async request<SuccessT, ErrorT = any, ReqT = {}>(params: RequestParams<ReqT>): Promise<ApiResponse<SuccessT, ErrorT>> {
        // TODO: Напишите здесь код, который с помощью fetch будет делать запрос

        try {
            const response = await fetch(...this.getRequestData(params));

            if (response.ok) {
                return {
                    success: true,
                    data: await response.json(),
                    status: StatusHTTP.OK,
                }
            }

            return {
                success: false,
                data: await response.json(),
                status: StatusHTTP.NOT_OK,
            }
        } catch (e) {
            return {
                success: false,
                data: e,
                status: StatusHTTP.UNEXPECTED_ERROR,
            }
        }
    }
}