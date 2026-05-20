import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Rating5 } from './Rating5';

describe('Rating5', () => {
  it('ラベルを表示する', () => {
    render(<Rating5 label="先生の印象" value={null} onChange={vi.fn()} />);
    expect(screen.getByText('先生の印象')).toBeInTheDocument();
  });

  it('未評価の場合「未評価」と表示する', () => {
    render(<Rating5 value={null} onChange={vi.fn()} />);
    expect(screen.getByText('未評価')).toBeInTheDocument();
  });

  it('評価済みの場合「x / 5」と表示する', () => {
    render(<Rating5 value={3} onChange={vi.fn()} />);
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('ボタンをクリックするとonChangeが呼ばれる', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Rating5 value={null} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: '4' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('選択中のボタンを再クリックするとnullを返す', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Rating5 value={3} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('選択中のボタンにaria-checked=trueが設定される', () => {
    render(<Rating5 value={5} onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: '5' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '3' })).toHaveAttribute('aria-checked', 'false');
  });
});
