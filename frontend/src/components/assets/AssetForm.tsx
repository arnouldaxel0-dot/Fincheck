import { useForm } from 'react-hook-form'
import { Asset, ASSET_LABELS } from '../../types'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const catOpts = Object.entries(ASSET_LABELS).map(([v, l]) => ({ value: v, label: l }))
const curOpts = [{ value: 'EUR', label: 'EUR — Euro' }, { value: 'USD', label: 'USD — Dollar' }, { value: 'GBP', label: 'GBP — Livre' }]

export default function AssetForm({ onSubmit, defaultValues, loading }: { onSubmit: (d: object) => Promise<void>; defaultValues?: Partial<Asset>; loading?: boolean }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { name: defaultValues?.name||'', category: defaultValues?.category||'bank_account', value: defaultValues?.value?.toString()||'', currency: defaultValues?.currency||'EUR', institution: defaultValues?.institution||'', isin: defaultValues?.isin||'', quantity: defaultValues?.quantity?.toString()||'', purchase_price: defaultValues?.purchase_price?.toString()||'', description: defaultValues?.description||'' }
  })
  const category = watch('category')
  const showStock = ['stocks','bonds','crypto'].includes(category)

  const submit = async (data: any) => {
    const p: any = { name: data.name, category: data.category, value: parseFloat(data.value), currency: data.currency, institution: data.institution||undefined, description: data.description||undefined }
    if (showStock) { if (data.isin) p.isin=data.isin; if (data.quantity) p.quantity=parseFloat(data.quantity); if (data.purchase_price) p.purchase_price=parseFloat(data.purchase_price) }
    await onSubmit(p)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Input label="Nom de l'actif" placeholder="Ex: Livret A, Actions Apple..." error={errors.name?.message as string} {...register('name', { required: 'Obligatoire' })} /></div>
        <Select label="Catégorie" options={catOpts} {...register('category')} />
        <Select label="Devise" options={curOpts} {...register('currency')} />
        <div className="col-span-2"><Input label="Valeur actuelle (€)" type="number" step="0.01" placeholder="0.00" error={errors.value?.message as string} {...register('value', { required: 'Obligatoire' })} /></div>
        <div className="col-span-2"><Input label="Institution / Plateforme" placeholder="Ex: BNP, Boursorama, Binance..." {...register('institution')} /></div>
      </div>
      {showStock && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="col-span-2"><Input label="ISIN (optionnel)" placeholder="Ex: FR0000131104" {...register('isin')} /></div>
          <Input label="Quantité" type="number" step="any" {...register('quantity')} />
          <Input label="Prix d'achat unitaire (€)" type="number" step="0.01" {...register('purchase_price')} />
        </div>
      )}
      <Input label="Notes (optionnel)" {...register('description')} />
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>{defaultValues ? 'Enregistrer' : "Ajouter l'actif"}</Button></div>
    </form>
  )
}
