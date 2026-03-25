import type { GuideResponse, AnalysisResponse, ProjectData, SaveResponse } from '../types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function mockGenerateGuide(description: string, language: string): Promise<GuideResponse> {
  await delay(1200);
  return {
    projectTitle: `${language.charAt(0).toUpperCase() + language.slice(1)} Project: ${description.slice(0, 30)}`,
    steps: [
      { id: '1', stepNumber: 1, title: 'Set up the project structure', description: 'Create the main files and folders needed for your project.', completed: false },
      { id: '2', stepNumber: 2, title: 'Define your data model', description: 'Think about what data your app needs and how to represent it.', completed: false },
      { id: '3', stepNumber: 3, title: 'Build the core logic', description: 'Implement the main functionality described in your project idea.', completed: false },
      { id: '4', stepNumber: 4, title: 'Add user interaction', description: 'Connect inputs and outputs so the user can interact with your program.', completed: false },
      { id: '5', stepNumber: 5, title: 'Test and refine', description: 'Run your code, find bugs, and improve the experience.', completed: false },
    ],
  };
}

export async function mockAnalyzeCode(code: string, language: string): Promise<AnalysisResponse> {
  await delay(1500);

  if (!code.trim()) {
    return { explanations: [], suggestions: ['Start by writing your first function or variable.'], summary: 'No code detected yet.' };
  }

  return {
    summary: `This ${language} snippet defines the core logic of your project. It looks well-structured so far.`,
    explanations: [
      {
        functionName: 'main / entry point',
        explanation: 'This is the starting point of your program. It sets up the initial state and kicks off execution.',
        lineStart: 1,
        lineEnd: 5,
      },
      {
        functionName: 'helper function',
        explanation: 'This function handles a specific sub-task, keeping your code modular and easier to read.',
        lineStart: 7,
        lineEnd: 14,
      },
    ],
    suggestions: [
      'Consider adding error handling to your main function.',
      'You could extract repeated logic into a reusable helper.',
      'Add comments to explain the purpose of each section.',
      'Think about edge cases: what happens with empty or invalid input?',
    ],
  };
}

export async function mockSaveProject(project: ProjectData): Promise<SaveResponse> {
  await delay(600);
  return { success: true, projectId: project.id ?? `proj_${Date.now()}` };
}

export async function mockLoadProject(projectId: string): Promise<ProjectData> {
  await delay(800);
  return {
    id: projectId,
    name: 'Sample Project',
    description: 'A sample project loaded from mock storage.',
    language: 'javascript',
    code: '// Welcome back!\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n',
    guideSteps: [],
  };
}

export async function mockSendChatMessage(message: string, code: string, language: string): Promise<string> {
  await delay(1000 + Math.random() * 800);

  if (code.trim() === '') {
    return `Great question! Start by writing some ${language} code in the editor and I'll help you understand it as you go.`;
  }

  const responses = [
    `Looking at your ${language} code, I can see you're making good progress. ${message.includes('?') ? "To answer your question: the code works by processing each element sequentially." : "Keep going — you're on the right track."}`,
    `That's a solid approach. In ${language}, what you've written follows a common pattern. Consider also handling edge cases like empty inputs or null values.`,
    `Good thinking! The logic you've implemented looks correct. One thing to consider: you could make this more reusable by extracting it into a separate function.`,
    `I see what you're trying to do. In ${language}, a cleaner way to express this would be to break the logic into smaller, named steps — it makes debugging much easier.`,
    `Nice work so far. The structure of your code is clear. Next, think about what happens when the user provides unexpected input — that's usually where bugs hide.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
