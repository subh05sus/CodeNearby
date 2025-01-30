interface IpApiResponse {
    query: string;
    status: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
}

async function getIpAddress(): Promise<string> {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

export async function getLocationByIp(ip?: string): Promise<IpApiResponse> {
    // If no IP is provided, get the current user's IP
    const targetIp = ip || await getIpAddress();
    
    const response = await fetch(`http://ip-api.com/json/${targetIp}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    
    const data: IpApiResponse = await response.json();
    return data;
}