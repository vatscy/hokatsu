import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { FormShell } from '../components/form/FormShell';
import { useKindergartensStore } from '../stores/kindergartensStore';

export function NewPage() {
  const navigate = useNavigate();
  const create = useKindergartensStore((s) => s.create);

  return (
    <Container>
      <h1 className="text-xl font-bold mb-4">新規登録</h1>
      <FormShell
        initial={{}}
        submitLabel="保存"
        onSubmit={async (value) => {
          await create(value);
          navigate('/');
        }}
        onCancel={() => navigate(-1)}
      />
    </Container>
  );
}
