import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import StudentLiveView from '../src/components/views/StudentLiveView';
import { evaluateStudentAdvance, validateStudentInput } from '../../lib/livePacingEngine';

// Mock Supabase client to prevent actual network calls
vi.mock('../src/lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ error: null }),
            then: vi.fn().mockImplementation((cb) => Promise.resolve(cb()))
        })),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnValue({}),
        })),
        removeChannel: vi.fn(),
    }
}));

// Mock math rendering and progress telemetry
vi.mock('../src/lib/progressSync', () => ({ syncProgress: vi.fn() }));
vi.mock('../src/components/shared/MathDisplay', () => ({ default: ({ content }) => <div>{content}</div> }));
vi.mock('../src/components/visuals/VisualRenderer', () => ({ default: () => <div data-testid="visual" /> }));

describe('StudentLiveView Actual Component Suite', () => {
    const defaultPacket = [
        { id: 'q1', text: 'Question 1', answerType: 'standard', originalIndex: 0, resolvedData: { answer: '42' } },
        { id: 'q2', text: 'Question 2', answerType: 'standard', originalIndex: 1, resolvedData: { answer: '10' } }
    ];

    const createSession = (pacing = 'open', responseStyle = 'flexible') => ({
        id: 'room_123',
        title: 'Math Test',
        class_code: 'TEST1',
        active_question_data: {
            settings: { pacing, responseStyle, summary: true }
        }
    });

    it('progressive pacing: does NOT render pagination chevrons', () => {
        render(
            <StudentLiveView 
                session={createSession('progressive')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        // Chevrons should NOT be in the DOM
        expect(screen.queryByTitle(/Föregående fråga/i)).toBeNull();
        expect(screen.queryByTitle(/Nästa fråga/i)).toBeNull();
    });

    it('open pacing: renders pagination chevrons', () => {
        render(
            <StudentLiveView 
                session={createSession('open')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        expect(screen.getByTitle(/Föregående fråga/i)).toBeDefined();
        expect(screen.getByTitle(/Nästa fråga/i)).toBeDefined();
    });

    it('progressive pacing: auto-advances to next question after submitting', async () => {
        vi.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(
            <StudentLiveView 
                session={createSession('progressive')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        expect(screen.getByText(/Uppgift 1 av 2/i)).toBeDefined();

        // Fill in answer input
        const input = screen.getByRole('textbox');
        await user.type(input, '42');

        // Submit answer
        const submitBtn = screen.getByRole('button', { name: /Skicka in/i });
        await user.click(submitBtn);

        // Fast-forward past the 600ms grace timeout
        act(() => {
            vi.advanceTimersByTime(700);
        });

        // Question 2 should now be visible
        expect(screen.getByText(/Uppgift 2 av 2/i)).toBeDefined();
        vi.useRealTimers();
    });
});