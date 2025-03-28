import { PencilIcon } from '@heroicons/react/solid';
import { Button } from '@/components/Elements';
import { Field, Textarea, Select, FormDrawer, Dropzone } from '@/components/Form';
import { Authorization, ROLES } from '@/lib/authorization';
import { useMutation, useQuery } from 'react-query';
import { fetchExercise, updateExercise } from '../api';
import { useNotificationStore } from '@/stores/notifications';
import { useFormik } from 'formik';
import { createExerciseSchema } from '@/utils/yup';
import { fetchCategories } from '@/features/categories/api';
import { fetchAllCollections } from '@/features/collections/api';
import { fetchEquipments } from '@/features/equipment/api';

type UpdateExerciseProps = {
  exerciseId: string;
};
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

export const UpdateExercise = ({ exerciseId }: UpdateExerciseProps) => {
  const { addNotification } = useNotificationStore();
  const { data, refetch } = useQuery('get-exercise', () => fetchExercise(exerciseId));
  const { mutate, isLoading, isSuccess } = useMutation(updateExercise, {
    onSuccess: (message: string) => {
      addNotification({
        type: 'success',
        title: message,
      });
    },
  });

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
  const initialValues: FormikState = {
    title: data?.title || '',
    description: data?.description || '',
    vimeoId: data?.vimeoId || '',
    categories: data?.categories || [],
    collections: data?.collections || [],
    equipments: data?.equipments || [],
    difficulty: data?.difficulty || 0,
    image: data?.thumbnail,
    deleteImage: false,
  };
  const formik = useFormik({
    initialValues,
    validationSchema: createExerciseSchema,
    onSubmit: (v) => onSubmit(v),
  });
  const onSubmit = (value: any) => {
    mutate({ exerciseId, payload: value });
  };

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={isSuccess}
        triggerButton={
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Update Exercise
          </Button>
        }
        title="Update Exercise"
        submitButton={
          <Button form="update-exercise" type="submit" size="sm" isLoading={isLoading}>
            Submit
          </Button>
        }
      >
        <form id="update-exercise" onSubmit={formik.handleSubmit}>
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
