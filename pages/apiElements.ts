import { APIRequestContext, APIResponse } from '@playwright/test';
import { CONFIG } from '../config';
import { RequestParams, Post } from '../types/api.types';

export class ApiElements {
    private readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

   
    async fillingRequest(params?: RequestParams): Promise<APIResponse> {
        return await this.request.get(CONFIG.apiPath, {
            params,
        });
    }

   
    async getPosts(params?: RequestParams): Promise<Post[]> {
        const response = await this.fillingRequest(params);
        
        if (!response.ok()) {
            throw new Error(`API request failed with status ${response.status()}`);
        }

        return response.json();
    }

   
    static validatePostStructure(post: Post): boolean {
        return (
            typeof post.id === 'number' &&
            typeof post.date === 'string' &&
            typeof post.title?.rendered === 'string' &&
            typeof post.content?.rendered === 'string' &&
            new Date(post.date).toString() !== 'Invalid Date'
        );
    }

   
    static async checkResponseStatus(response: APIResponse): Promise<number> {
        return response.status();
    }
}