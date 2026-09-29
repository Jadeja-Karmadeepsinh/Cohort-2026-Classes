import { createFileRoute } from '@tanstack/react-router'
import ManualForm from '../components/ManualForm.jsx'

export const Route = createFileRoute('/ManualForm')({
  component: ManualForm,
});