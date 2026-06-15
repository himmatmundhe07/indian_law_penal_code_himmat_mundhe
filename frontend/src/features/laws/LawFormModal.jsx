import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';

const lawSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  section: Yup.string().required('Section number is required'),
  act: Yup.string().required('Act is required'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  punishment: Yup.string(),
  bailable: Yup.boolean(),
  cognizable: Yup.boolean(),
  status: Yup.string().oneOf(['active', 'inactive', 'repealed']),
  state: Yup.string(),
  court: Yup.string(),
  importance: Yup.number().min(1).max(10),
});

const EMPTY_LAW = {
  title: '', section: '', act: '', category: '', description: '',
  punishment: '', bailable: false, cognizable: false, status: 'active',
  state: '', court: '', importance: 5,
};

export default function LawFormModal({ initialData, onClose, onSuccess }) {
  const isEdit = !!initialData;

  const formik = useFormik({
    initialValues: isEdit ? {
      title: initialData.title || '',
      section: initialData.section || '',
      act: initialData.act || '',
      category: initialData.category || '',
      description: initialData.description || '',
      punishment: initialData.punishment || '',
      bailable: initialData.bailable ?? false,
      cognizable: initialData.cognizable ?? false,
      status: initialData.status || 'active',
      state: initialData.state || '',
      court: initialData.court || '',
      importance: initialData.importance || 5,
    } : EMPTY_LAW,
    validationSchema: lawSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await api.patch(`/laws/${initialData._id || initialData.id}`, values);
          toast.success('Law updated successfully');
        } else {
          await api.post('/laws', values);
          toast.success('Law created successfully');
        }
        onSuccess();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    },
  });

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="dark:bg-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
        {isEdit ? 'Edit Law' : 'Add New Law'}
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent className="dark:bg-gray-800 space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              name="title" label="Title" fullWidth size="small"
              value={formik.values.title} onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
            <TextField
              name="section" label="Section Number" fullWidth size="small"
              value={formik.values.section} onChange={formik.handleChange}
              error={formik.touched.section && Boolean(formik.errors.section)}
              helperText={formik.touched.section && formik.errors.section}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
            <TextField
              name="act" label="Act" fullWidth size="small"
              value={formik.values.act} onChange={formik.handleChange}
              error={formik.touched.act && Boolean(formik.errors.act)}
              helperText={formik.touched.act && formik.errors.act}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
            <TextField
              name="category" label="Category" fullWidth size="small"
              value={formik.values.category} onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
            <TextField
              name="punishment" label="Punishment" fullWidth size="small"
              value={formik.values.punishment} onChange={formik.handleChange}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
            <TextField
              name="importance" label="Importance (1-10)" type="number" fullWidth size="small"
              value={formik.values.importance} onChange={formik.handleChange}
              slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" }, htmlInput: { min: 1, max: 10 } }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel className="dark:text-gray-300">Status</InputLabel>
              <Select
                name="status"
                value={formik.values.status}
                label="Status"
                onChange={formik.handleChange}
                className="dark:text-white dark:bg-gray-700"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="repealed">Repealed</MenuItem>
              </Select>
            </FormControl>

            <div className="flex gap-4 items-center">
              <FormControlLabel
                control={
                  <Checkbox 
                    name="bailable" 
                    checked={formik.values.bailable} 
                    onChange={formik.handleChange} 
                    className="dark:text-gray-300"
                  />
                }
                label={<span className="dark:text-gray-300">Bailable</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="cognizable" 
                    checked={formik.values.cognizable} 
                    onChange={formik.handleChange} 
                    className="dark:text-gray-300"
                  />
                }
                label={<span className="dark:text-gray-300">Cognizable</span>}
              />
            </div>
          </div>

          <TextField
            name="description" label="Description" fullWidth multiline rows={4} className="mt-4"
            value={formik.values.description} onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            slotProps={{ input: { className: "dark:text-white dark:bg-gray-700" } }}
            InputLabelProps={{ className: "dark:text-gray-300" }}
          />
        </DialogContent>
        
        <DialogActions className="dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <Button onClick={onClose} color="inherit" className="dark:text-gray-300">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            className="!bg-primary-600"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : (isEdit ? 'Update Law' : 'Create Law')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
