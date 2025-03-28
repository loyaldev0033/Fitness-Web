import * as Yup from 'yup';
const MAX_FILE_SIZE = 102400; //100KB
type ValidFileExtensions = {
  image: string[];
};
const validFileExtensions: ValidFileExtensions = {
  image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp'],
};
const isValidFileType = (fileName: string, fileType: keyof ValidFileExtensions) => {
  return (
    fileName && validFileExtensions[fileType].indexOf(fileName.split('.').pop() as string) > -1
  );
};

Yup.setLocale({
  mixed: {
    required: 'The field is required',
    oneOf: '',
  },
  string: {
    email: 'You have entered wrong email address',
    min({ min }) {
      return `The field must have at least ${min} characters`;
    },
    max({ max }) {
      return `The field must have at least ${max} characters`;
    },
  },
});
export const userLoginSchema = Yup.object().shape({
  email: Yup.string().max(255).required(),
  password: Yup.string().max(255).required(),
});

export const createExerciseSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  description: Yup.string().max(255).required(),
  vimeoId: Yup.string().max(255).required(),
  categories: Yup.array()
    .of(Yup.string().required('Category is required'))
    .min(1, 'At least one category is required')
    .required('Categories are required'),
  collections: Yup.array()
    .of(Yup.string().required('Collection is required'))
    .min(1, 'At least one collection is required')
    .required('Collections are required'),
  equipment: Yup.array().of(Yup.string().required('Equipment is required')),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createEquipmentSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  price: Yup.string().max(255).required(),
  link: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createTagSchema = Yup.object().shape({
  name: Yup.string().max(255).required(),
});

export const createVimeoSchema = Yup.object().shape({
  vimeoId: Yup.string().max(255).required(),
});

export const createUserSchema = Yup.object().shape({
  firstname: Yup.string().max(255).required(),
  lastname: Yup.string().max(255).required(),
});

export const createCollectionSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createCategorySchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  image: Yup.mixed().required('Thumbnail is required'),
});

export const createQuizSchema = Yup.object().shape({
  title: Yup.string().max(255).required(),
  level: Yup.string().max(255).required(),
});
