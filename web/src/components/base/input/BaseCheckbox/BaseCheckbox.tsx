import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import styles from './checkbox.module.css';

type BaseCheckboxProps = InputHTMLAttributes<HTMLInputElement>;

function BaseCheckbox({ ...props }: BaseCheckboxProps) {
  return ( 
    <div className={styles.container}>
      <input type="checkbox" className={styles.input} {...props} />
      <Check className={styles.icon} />
    </div>
   );
}

export default BaseCheckbox;