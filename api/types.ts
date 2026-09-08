export interface VercelRequest {
  method?: string;
  query: Record<string, any>;
  body: any;
  headers: Record<string, string | string[] | undefined>;
}

export interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  type: (contentType: string) => VercelResponse;
  end: () => VercelResponse;
}
