import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortSelector } from './SortSelector';

describe('SortSelector', () => {
  it('sortKeyの初期値が選択されている', () => {
    const onChange = vi.fn();
    render(<SortSelector sortKey="name" sortDir="asc" onChange={onChange} />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('name');
  });

  it('selectを変更するとonChangeが呼ばれる', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SortSelector sortKey="visitedAt" sortDir="asc" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox'), 'name');
    expect(onChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('ascの場合ボタンに「昇順」が表示される', () => {
    render(<SortSelector sortKey="name" sortDir="asc" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '昇順／降順を切り替え' })).toHaveTextContent('昇順');
  });

  it('descの場合ボタンに「降順」が表示される', () => {
    render(<SortSelector sortKey="name" sortDir="desc" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '昇順／降順を切り替え' })).toHaveTextContent('降順');
  });

  it('ボタンをクリックするとdirがトグルされる', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SortSelector sortKey="name" sortDir="asc" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: '昇順／降順を切り替え' }));
    expect(onChange).toHaveBeenCalledWith('name', 'desc');
  });
});
