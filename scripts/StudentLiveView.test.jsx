// scripts/StudentLiveView.test.jsx   "npx vitest run"
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StudentLiveView from '../src/components/views/StudentLiveView';

// 1. Mock Supabase client
vi.mock('../src/lib/supabaseClient', () => {
    const chainable = {};
    chainable.select = vi.fn().mockReturnValue(chainable);
    chainable.eq = vi.fn().mockReturnValue(chainable);
    chainable.insert = vi.fn().mockResolvedValue({ error: null });
    chainable.update = vi.fn().mockResolvedValue({ error: null });
    chainable.then = vi.fn().mockImplementation((cb) => Promise.resolve(cb({ data: [], error: null })));

    return {
        supabase: {
            from: vi.fn(() => chainable),
            channel: vi.fn(() => ({
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn().mockReturnValue({}),
            })),
            removeChannel: vi.fn(),
        }
    };
});

// 2. Mock telemetry & visuals
vi.mock('../src/lib/progressSync', () => ({ syncProgress: vi.fn() }));
vi.mock('../src/components/shared/MathDisplay', () => ({ default: ({ content }) => <div>{content}</div> }));
vi.mock('../src/components/visuals/VisualRenderer', () => ({ default: () => <div data-testid="visual" /> }));

// 3. Mock PreferencesToggle
vi.mock('../src/components/ui/PreferencesToggle', () => ({
    default: () => <div data-testid="mock-preferences-toggle" />
}));

// 4. Mock MathScratchpad
vi.mock('../src/components/ui/MathScratchpad', () => ({
    default: ({ steps, onChange, disabled }) => (
        <div data-testid="mock-scratchpad">
            <input 
                data-testid="scratchpad-input"
                disabled={disabled}
                value={steps[0] || ''} 
                onChange={(e) => onChange([e.target.value])} 
            />
        </div>
    )
}));

describe('StudentLiveView Regression & Pacing Suite', () => {
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('progressive pacing: hides navigation chevrons', () => {
        render(
            <StudentLiveView 
                session={createSession('progressive')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        expect(screen.queryByTitle(/Föregående fråga/i)).toBeNull();
        expect(screen.queryByTitle(/Nästa fråga/i)).toBeNull();
    });

    it('teacher-led pacing: hides navigation chevrons and locks manual paging', () => {
        render(
            <StudentLiveView 
                session={createSession('teacher')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        expect(screen.queryByTitle(/Föregående fråga/i)).toBeNull();
        expect(screen.queryByTitle(/Nästa fråga/i)).toBeNull();
    });

    it('open pacing: renders navigation chevrons and allows flipping questions', () => {
        render(
            <StudentLiveView 
                session={createSession('open')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        const nextBtn = screen.getByTitle(/Nästa fråga/i);
        expect(nextBtn).toBeDefined();

        fireEvent.click(nextBtn);
        expect(screen.getByText(/Uppgift 2 av 2/i)).toBeDefined();
    });

    // 🟢 Uses real timers with waitFor to allow the Supabase promise and 400ms advance timer to settle
    it('progressive pacing: auto-advances to the next question upon answer submission', async () => {
        render(
            <StudentLiveView 
                session={createSession('progressive')} 
                packet={defaultPacket} 
                studentAlias="TestStudent" 
            />
        );

        expect(screen.getByText(/Uppgift 1 av 2/i)).toBeDefined();

        // 1. Enter answer
        const input = screen.getByPlaceholderText(/Ditt svar/i);
        fireEvent.change(input, { target: { value: '42' } });

        // 2. Click submit
        const submitBtn = screen.getByRole('button', { name: /Skicka in/i });
        fireEvent.click(submitBtn);

        // 3. Wait for the debounce timeout + index progression
        await waitFor(() => {
            expect(screen.getByText(/Uppgift 2 av 2/i)).toBeDefined();
        }, { timeout: 2000 });
    });
});