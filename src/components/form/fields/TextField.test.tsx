import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from './TextField';

describe('TextField', () => {
  it('ラベルを表示する', () => {
    render(<TextField label="園名" value="" onChange={vi.fn()} />);
    expect(screen.getByText('園名')).toBeInTheDocument();
  });

  it('ラベル省略時はラベルを表示しない', () => {
    render(<TextField value="" onChange={vi.fn()} />);
    expect(screen.queryByText('園名')).toBeNull();
  });

  it('valueが表示される', () => {
    render(<TextField value="テスト保育園" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('テスト保育園')).toBeInTheDocument();
  });

  it('入力するとonChangeが文字列を渡す', () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'あいう' } });
    expect(onChange).toHaveBeenCalledWith('あいう');
  });
});
