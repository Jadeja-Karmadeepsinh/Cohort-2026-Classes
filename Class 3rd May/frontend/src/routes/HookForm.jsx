import { createFileRoute } from '@tanstack/react-router'
import HookForm from '../components/HookForm.jsx'

export const Route = createFileRoute('/HookForm')({
  component: HookForm,
});
