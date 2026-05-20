import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { KindergartenCard } from './KindergartenCard';
import type { Kindergarten } from '../../types/kindergarten';

const baseRecord = (): Kindergarten => ({
  id: 'card-id',
  name: 'テスト保育園',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const renderCard = (record: Kindergarten, onDelete = vi.fn()) =>
  render(
    <MemoryRouter>
      <KindergartenCard record={record} onDelete={onDelete} />
    </MemoryRouter>
  );

describe('KindergartenCard', () => {
  it('園名を表示する', () => {
    renderCard(baseRecord());
    expect(screen.getByText('テスト保育園')).toBeInTheDocument();
  });

  it('名前未入力の場合はプレースホルダを表示する', () => {
    renderCard({ ...baseRecord(), name: undefined });
    expect(screen.getByText('（園名未入力）')).toBeInTheDocument();
  });

  it('印象スコアが設定されている場合は表示する', () => {
    const record = {
      ...baseRecord(),
      impressions: { teacher: 4, childCare: 4, facility: null, toysBooks: null, principal: null },
    };
    renderCard(record);
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('印象スコア未入力の場合は"-"を表示する', () => {
    renderCard(baseRecord());
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('編集リンクが/edit/:idを指す', () => {
    renderCard(baseRecord());
    expect(screen.getByRole('link', { name: '編集' })).toHaveAttribute('href', '/edit/card-id');
  });

  it('削除ボタンクリックで確認し、OKならonDeleteを呼ぶ', async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderCard(baseRecord(), onDelete);
    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(onDelete).toHaveBeenCalledWith('card-id');
    vi.restoreAllMocks();
  });

  it('削除ボタンクリックでキャンセルならonDeleteは呼ばれない', async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderCard(baseRecord(), onDelete);
    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(onDelete).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
