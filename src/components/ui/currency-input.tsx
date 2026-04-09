import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value?: number
  onChange?: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    React.useEffect(() => {
      if (value !== undefined && value !== null && !isNaN(value)) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value)
        setDisplayValue(formatted)
      } else {
        setDisplayValue('')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value.replace(/\D/g, '')
      if (!rawValue) {
        setDisplayValue('')
        onChange?.(0)
        return
      }

      const numberValue = parseInt(rawValue, 10) / 100

      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numberValue)

      setDisplayValue(formatted)
      onChange?.(numberValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn('text-left', className)}
      />
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
