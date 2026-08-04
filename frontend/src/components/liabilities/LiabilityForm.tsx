import { useForm } from 'react-hook-form'
import { Liability, LIABILITY_LABELS } from '../../types'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const catOpts = Object.entries(LIABILITY_LABELS).map(([v, l]) => ({ value: v, label: l }))

export default function LiabilityForm({ onSubmit, defaultValues, loading }: { onSubmit: (d: object) => Promise<void>; defaultValues?: Partial<Liability>; loading?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: defaultValues?.name||'', category: defaultValues?.category||'mortgage', initial_amount: defaultValues?.initial_amount?.toString()||'', remaining_amount: defaultValues?.remaining_amount?.toString()||'', monthly_payment: defaultValues?.monthly_payment?.toString()||'', interest_rate: defaultValues?.interest_rate?.toString()||'', institution: defaultValues?.institution||'', start_date: defaultValues?.start_date?.slice(0,10)||'', end_date: defaultValues?.end_date?.slice(0,10)||'' }
  })

  const submit = async (data: any) => {
    const p: any = { name: data.name, category: data.category, initial_amount: parseFloat(data.initial_amount), remaining_amount: parseFloat(data.remaining_amount), institution: data.institution||undefined }
    if (data.monthly_payment) p.monthly_payment = parseFloat(data.monthly_payment)
    if (data.interest_rate) p.interest_rate = parseFloat(data.interest_rate)
    if (data.start_date) p.start_date = data.start_date
    if (data.end_date) p.end_date = data.end_date
    await onSubmit(p)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Input label="Nom du crédit" placeholder="Ex: Crédit immobilier résidence principale" error={errors.name?.message as string} {...register('name', { required: 'Obligatoire' })} /></div>
        <div className="col-span-2"><Select label="Type de crédit" options={catOpts} {...register('category')} /></div>
        <Input label="Montant initial (€)" type="number" step="0.01" placeholder="200000" error={errors.initial_amount?.message as string} {...register('initial_amount', { required: 'Obligatoire' })} />
        <Input label="Capital restant dû (€)" type="number" step="0.01" placeholder="150000" error={errors.remaining_amount?.message as string} {...register('remaining_amount', { required: 'Obligatoire' })} />
        <Input label="Mensualité (€)" type="number" step="0.01" placeholder="800" {...register('monthly_payment')} />
        <Input label="Taux d'intérêt (%)" type="number" step="0.01" placeholder="3.5" {...register('interest_rate')} />
        <Input label="Date de début" type="date" {...register('start_date')} />
        <Input label="Date de fin" type="date" {...register('end_date')} />
        <div className="col-span-2"><Input label="Banque / Organisme" placeholder="Ex: Crédit Agricole, Cetelem..." {...register('institution')} /></div>
      </div>
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>{defaultValues ? 'Enregistrer' : 'Ajouter le crédit'}</Button></div>
    </form>
  )
}
