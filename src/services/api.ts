import axios from 'axios';
import type { GuideResponse, AnalysisResponse, ProjectData, SaveResponse } from '../types';
import { mockGenerateGuide, mockAnalyzeCode, mockSaveProject, mockLoadProject, mockSendChatMessage } from './mockApi';

// Toggle this to false to use the real Java backend
const USE_MOCK = true;

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function generateGuide(description: string, language: string): Promise<GuideResponse> {
  if (USE_MOCK) return mockGenerateGuide(description, language);
  const { data } = await client.post<GuideResponse>('/guide/generate', { description, language });
  return data;
}

export async function analyzeCode(code: string, language: string, projectDescription: string): Promise<AnalysisResponse> {
  if (USE_MOCK) return mockAnalyzeCode(code, language);
  const { data } = await client.post<AnalysisResponse>('/code/analyze', { code, language, projectDescription });
  return data;
}

export async function saveProject(project: ProjectData): Promise<SaveResponse> {
  if (USE_MOCK) return mockSaveProject(project);
  const { data } = await client.post<SaveResponse>('/projects/save', project);
  return data;
}

export async function loadProject(projectId: string): Promise<ProjectData> {
  if (USE_MOCK) return mockLoadProject(projectId);
  const { data } = await client.get<ProjectData>(`/projects/${projectId}`);
  return data;
}

export async function sendChatMessage(message: string, code: string, language: string): Promise<string> {
  if (USE_MOCK) return mockSendChatMessage(message, code, language);
  const { data } = await client.post<{ message: string }>('/chat/message', { message, code, language });
  return data.message;
}
