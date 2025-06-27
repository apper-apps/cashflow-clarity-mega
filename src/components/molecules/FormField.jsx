import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ 
  type = 'input',
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  options = [],
  placeholder,
  ...props 
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  if (type === 'select') {
    return (
      <Select
        label={label}
        value={value}
        onChange={handleChange}
        error={error}
        required={required}
        options={options}
        placeholder={placeholder}
        {...props}
      />
    );
  }

  return (
    <Input
      type={type}
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default FormField;