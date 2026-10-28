// scripts/TeacherLiveView.test.jsx       "npx vitest run"
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TeacherLiveView from '../src/components/views/TeacherLiveView';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
    const chainable = {};
    chainable.select = vi.fn().mockReturnValue(chainable);
    chainable.eq = vi.fn().mockReturnValue(chainable);
    chainable.in = vi.fn().mockReturnValue(chainable);
    chainable.delete = vi.fn().mockReturnValue(chainable);
    chainable.update = vi.fn().mockReturnValue(chainable);
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

vi.mock('../src/lib/progressSync', () => ({
    syncProgress: vi.fn(),
    syncBatchProgress: vi.fn()
}));
vi.mock('../src/components/shared/MathDisplay', () => ({ default: ({ content }) => <div>{content}</div> }));
vi.mock('../src/components/visuals/VisualRenderer', () => ({ default: () => <div data-testid="visual" /> }));
vi.mock('../src/components/ui/PreferencesToggle', () => ({
    default: () => <div data-testid="mock-preferences-toggle" />
}));

describe('TeacherLiveView Regression Suite', () => {
    const mockPacket = [
        { id: 'q1', text: 'Prompt 1', answerType: 'standard', originalIndex: 0, resolvedData: { answer: '5' } },
        { id: 'q2', text: 'Prompt 2', answerType: 'standard', originalIndex: 1, resolvedData: { answer: '9' } }
    ];

    const session = {
        id: 'room_123',
        title: 'Live Algebra Session',
        class_code: 'KLASS1',
        active_question_data: {
            settings: { pacing: 'teacher' }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the class matrix and sorting menu trigger', async () => {
        await act(async () => {
            render(
                <TeacherLiveView 
                    session={session} 
                    packet={mockPacket} 
                    onEnd={vi.fn()} 
                    onKick={vi.fn()} 
                />
            );
        });

        expect(screen.getByText('KLASS1')).toBeDefined();
        expect(screen.getByTitle(/Sortera elever/i)).toBeDefined();
    });

    it('opens zoom dialogue and presents "Tvinga hit klassen" button in teacher pacing', async () => {
        const user = userEvent.setup();
        await act(async () => {
            render(
                <TeacherLiveView 
                    session={session} 
                    packet={mockPacket} 
                    onEnd={vi.fn()} 
                    onKick={vi.fn()} 
                />
            );
        });

        const q1HeaderBtn = screen.getByRole('button', { name: /Q1/i });
        await user.click(q1HeaderBtn);

        const pushBtn = screen.getByRole('button', { name: /Tvinga hit klassen/i });
        expect(pushBtn).toBeDefined();

        await user.click(pushBtn);
        expect(supabase.from).toHaveBeenCalledWith('rooms');
    });
});