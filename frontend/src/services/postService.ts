import { NewPost, Post } from "@/types";
import axios from "axios";
import { authService } from "./authService";

const PAGE_SIZE = 5;
const BASE_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api`;

const authHeaders = async () => ({
    Authorization: `Bearer ${await authService.getAccessToken()}`,
    "Content-Type": "application/json",
});

export const postService = {
    
    // All the services regarding posts
    async readPosts(page: number, pageSize: number) {
        try {            
            const response = await axios(
                `${BASE_URL}/posts`
                , { headers: {
                "Content-Type": "application/json",
                },
                params: {
                    page,
                    size: PAGE_SIZE,
                    sortBy: "createdAt",
                    descending: true,
                },
            });
            console.log(response);
            return response;
        } catch (err) {
            return undefined;
          }
    },
    
    async deletePost(id: string, page: number): Promise<Post[] | undefined> {
  
        try {  
            await axios.delete(`${BASE_URL}/posts/${id}`,
                { headers: {
                ...await authHeaders(),
                }
            });
            const posts = await this.readPosts(page, PAGE_SIZE);
      
            return posts?.data.content;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    async savePost(id: string, post: NewPost, page: number): Promise<Post[] | undefined> {
        try {  
        await axios.put(`${BASE_URL}/posts/${id}`,
            post,
            { headers: {
                ...await authHeaders(),
            }
            });
            const resp = await this.readPosts(page, PAGE_SIZE);
            if (resp !== undefined) return resp.data.content;
            return undefined;
        }
            catch (err) {
            console.log(err);
        }
    },
    
    async postNew(page: number, newPost: NewPost): Promise<Post[] | undefined> {

        try {
            const response = await axios.post(`${BASE_URL}/posts`,
                 newPost  ,
            { headers: {
                    ...await authHeaders(),
                }
            });
            console.log(response);
            
            const resp = await this.readPosts(page, PAGE_SIZE);
            if (resp !== undefined) return resp.data.content;
            return undefined;
            
        } catch (err) {
            return undefined;
        }
    }
}
