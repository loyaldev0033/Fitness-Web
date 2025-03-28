import { PlusIcon } from '@heroicons/react/outline';
import { Button } from '@/components/Elements';
import { FormDrawer } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { createExercise } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { Field, Dropzone } from '@/components/Form';
import { createExerciseSchema } from '@/utils/yup';
import { Textarea, Select } from '@/components/Form';
import { fetchCategories } from '@/features/categories/api';
import { fetchAllCollections } from '@/features/collections/api';
import { fetchEquipments } from '@/features/equipment/api';

interface FormikState {
  title: string;
  description: string;
  vimeoId: string;
  categories: Array<string>;
  collections: Array<string>;
  equipments: Array<string>;
  difficulty: number;
  deleteImage: boolean;
  image: any;
}

export const CreateExercise = () => {
  const { addNotification } = useNotificationStore();
  const { mutate, isLoading, isSuccess } = useMutation(createExercise, {
    onSuccess: (message: string) => {
      formik.resetForm();
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

  const initialValues: FormikState = {
    title: '',
    description: '',
    vimeoId: '',
    categories: [],
    collections: [],
    equipments: [],
    difficulty: 0,
    image: '',
    deleteImage: false,
  };

  const { data: categories } = useQuery('get-categories', fetchCategories);
  const { data: collections } = useQuery('get-collections', fetchAllCollections);
  const { data: equipments } = useQuery('get-equipments', fetchEquipments);
  const categoryOptions = categories?.map((v) => {
    return { value: v._id, label: v.title };
  });
  const collectionOptions = collections?.map((v) => {
    return { value: v._id, label: v.title };
  });
  const equipmentOptions = equipments?.map((v) => {
    return { value: v._id, label: v.title };
  });

  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate(value);
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Create Exercise
          </Button>
        }
        title="Create Exercise"
        submitButton={
          <Button form="create-exercise" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="create-exercise" onSubmit={formik.handleSubmit}>
          <Field label="Title" formik={formik} name="title" />
          <Textarea label="Description" formik={formik} name="description" />
          <Field label="Vimeo" formik={formik} name="vimeoId" />
          <Dropzone
            label="Thumbnail"
            name="image"
            formik={formik}
            defaultImg={formik.values.image}
            onDrop={(img) => formik.setFieldValue('image', img)}
            onDelete={() => formik.setValues({ ...formik.values, image: '', deleteImage: true })}
          />
          <Select
            className="mb-4"
            isMulti
            formik={formik}
            label="Categories"
            name="categories"
            options={categoryOptions}
            value={categoryOptions?.filter((el) => formik.values.categories.includes(el.value))}
            onChange={(value: any, e) => {
              const subs = value.map((v: any) => v.value);
              formik.setFieldValue('categories', subs);
            }}
          />
          <Select
            className="mb-4"
            isMulti
            formik={formik}
            label="Collections"
            name="collections"
            options={collectionOptions}
            value={collectionOptions?.filter((el) => formik.values.collections.includes(el.value))}
            onChange={(value: any, e) => {
              const subs = value.map((v: any) => v.value);
              formik.setFieldValue('collections', subs);
            }}
          />
          <Select
            className="mb-4"
            isMulti
            formik={formik}
            label="Equipment"
            name="equipments"
            options={equipmentOptions}
            value={equipmentOptions?.filter((el) => formik.values.equipments.includes(el.value))}
            onChange={(value: any, e) => {
              const subs = value.map((v: any) => v.value);
              formik.setFieldValue('equipments', subs);
            }}
          />
          <Field label="Difficulty Level" type="number" formik={formik} name="difficulty" />
        </form>
      </FormDrawer>
    </Authorization>
  );
};
