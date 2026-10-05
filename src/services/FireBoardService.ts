import type { FireBoardDevice, FireBoardTemp } from '../types';

const BASE_URL = "https://fireboard.io/api";

export class FireBoardService {
    
    static async login(username: string, password: string): Promise<string> {
        const response = await fetch(`${BASE_URL}/rest-auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'BBQPlanner-App-Web'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            let errorMsg = 'Login failed';
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.key; // The auth token
    }

    static async fetchDevices(token: string): Promise<FireBoardDevice[]> {
        const response = await fetch(`${BASE_URL}/v1/devices.json`, {
            headers: {
                'Authorization': `Token ${token}`,
                'User-Agent': 'BBQPlanner-App-Web'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    }

    static async fetchLatestTemps(token: string, deviceUUID: string): Promise<FireBoardTemp[]> {
        const response = await fetch(`${BASE_URL}/v1/devices/${deviceUUID}/temps.json`, {
            headers: {
                'Authorization': `Token ${token}`,
                'User-Agent': 'BBQPlanner-App-Web'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch temperatures');
        return response.json();
    }
}
