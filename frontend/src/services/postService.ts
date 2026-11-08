import { NewPost, Post } from "@/types";
import axios, { AxiosError, HttpStatusCode } from "axios";
import { authService } from "./authService";

const PAGE_SIZE = 5;
const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const authHeaders = async () => ({
    Authorization: `Bearer ${await authService.getAccessToken()}`,
    "Content-Type": "application/json",
});

export const postService = {

    // get amount of emojis from a post
    async postAmountOfEmoji(postId: string, index: number, amount: number): Promise<number> {
        try {            
            const response = await axios.post(
                `${BASE_URL}/posts/${postId}/reactions/amount`, { index: index, amount: amount }
                , { headers: {
                    ...await authHeaders(),
                },
            });
            return response.status;
            
        } catch (err : AxiosError | any) {
            return err.response?.status ?? HttpStatusCode.InternalServerError;
          }        
    },
        
    // get amount of emojis from a post
    async getAmountOfEmojis(postId: string): Promise<number[] | number> {
        try {            
            const response = await axios(
                `${BASE_URL}/posts/${postId}/reactions/amount`
                , { headers: {
                    ...await authHeaders(),
                },
            });
            return response.data;
            
        } catch (err : AxiosError | any) {
            return err.response?.status ?? HttpStatusCode.InternalServerError;
          }        
    },
    
    // delete all reactions from a post
    async deleteAllReactions(postId: string): Promise<number> {
        try {
            const response = await axios.delete(
                `${BASE_URL}/posts/${postId}/reactions`,
                { headers: {
                    ...await authHeaders(),
                },
                },
            );
            
            return response.status;
        } catch (err : AxiosError | any) {
            return err.response?.status ?? HttpStatusCode.InternalServerError;
        }
    },

    // reaction to post
    async reactToPost(postId: string, reaction: string): Promise<number> {
        try {
            const response = await axios.post(
                `${BASE_URL}/posts/${postId}/reactions`,
                { emoji: reaction },
            );

            return response.status;
        } catch (err: AxiosError | any) {
            return err.response?.status ?? HttpStatusCode.InternalServerError;
        }
    },
    
    // All the services regarding posts
    async readPosts(page: number, pageSize: number): Promise<Object | HttpStatusCode> {
        try {            
            const response = await axios(
                `${BASE_URL}/posts`
                , { headers: {
                    ...await authHeaders(),
                },
                params: {
                    page,
                    size: PAGE_SIZE,
                    sortBy: "createdAt",
                    descending: true,
                },
            });
            return response;
            
        } catch (err : AxiosError | any) {
            return err.response?.status ?? HttpStatusCode.InternalServerError;
          }
    },
    
    async deletePost(id: string, page: number) {
  
        try {
            const r: HttpStatusCode = await axios.delete(`${BASE_URL}/posts/${id}`,
                { headers: {
                ...await authHeaders(),
                }
            });
        
            // return error code
            return r;
            
        } catch (err : AxiosError | any) {;
            switch (err) {
                case null:
                    return HttpStatusCode.InternalServerError;
                default:
                    return err.response?.status ?? HttpStatusCode.InternalServerError;
            }
        }
    },

    async savePost(id: string, post: NewPost, page: number): Promise<Post | HttpStatusCode> {
        try {  
            const response = await axios.put(`${BASE_URL}/posts/${id}`,
                post,
                { headers: {
                    ...await authHeaders(),
                }
                });
        
            if (response.status === HttpStatusCode.Created) {
                console.log("Post updated successfully:", response.data);   
                return response.data;
            }
            return response.status;
            
        } catch (err: AxiosError | any) {
            console.log(err);
            return err.response?.status ?? HttpStatusCode.InternalServerError;
        }
    },
    
    async postNew(page: number, newPost: NewPost): Promise<Post | HttpStatusCode> {

        try {
            const response = await axios.post(`${BASE_URL}/posts`,
                 newPost  ,
            { headers: {
                    ...await authHeaders(),
                }
            });
            console.log(response);
            
            if (response.status !== HttpStatusCode.Created) return response.status;
            
            // Return the response (Post), if the request was successful
            return response.data;
            
        } catch (err: AxiosError | any) {
            console.log(err);
            return err.response?.status ?? HttpStatusCode.InternalServerError;
        }
    }
}
