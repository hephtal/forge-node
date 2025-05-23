import AutoFormCombobox from './fields/combobox';
import AutoFormCheckbox from './fields/checkbox';
import AutoFormDate from './fields/date';
import AutoFormEnum from './fields/enum';
import AutoFormFile from './fields/file';
import AutoFormGraphConnector from './fields/graph-connector';
import AutoFormInput from './fields/input';
import AutoFormMultiSelect from './fields/multi-select';
import AutoFormNumber from './fields/number';
import AutoFormRadioGroup from './fields/radio-group';
import AutoFormSelectAdd from './fields/select_add';
import AutoFormSwitch from './fields/switch';
import AutoFormTextarea from './fields/textarea';

export const INPUT_COMPONENTS = {
  checkbox: AutoFormCheckbox,
  date: AutoFormDate,
  select: AutoFormEnum,
  radio: AutoFormRadioGroup,
  switch: AutoFormSwitch,
  textarea: AutoFormTextarea,
  number: AutoFormNumber,
  file: AutoFormFile,
  fallback: AutoFormInput,
  combobox: AutoFormCombobox,
  select_add: AutoFormSelectAdd,
  multi_select: AutoFormMultiSelect,
  graph_connector: AutoFormGraphConnector,
};

/**
 * Define handlers for specific Zod types.
 * You can expand this object to support more types.
 */
export const DEFAULT_ZOD_HANDLERS: {
  [key: string]: keyof typeof INPUT_COMPONENTS;
} = {
  ZodBoolean: 'checkbox',
  ZodDate: 'date',
  ZodEnum: 'select',
  ZodNativeEnum: 'select',
  ZodNumber: 'number',
};
