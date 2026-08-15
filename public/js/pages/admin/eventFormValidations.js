const setFieldError = (input, message) => {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.classList.toggle('invalid', Boolean(message));

  if (errorEl) {
    errorEl.textContent = message;
  }
};

const validateField = (input) => {
  const message = input.value.trim() ? '' : 'Field is required.';
  setFieldError(input, message);
  return message === '';
};

import { createEvent, updateEvent, deleteEvent } from '../../api/adminApi.js';
import { getCurrentUser } from '../../api/authApi.js';
import { getEvent } from '../../api/eventsApi.js';
import { fetchCategories } from '../../api/categoriesApi.js';
import { showConfirmModal } from '../../utils/modal.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

const populateCategorySelect = async () => {
  const select = document.getElementById('category');
  if (!select) return;

  const previousValue = select.value;
  const categories = await fetchCategories();

  select.innerHTML = '<option value="" disabled selected>Select a category</option>';
  categories.forEach(({ category_name }) => {
    const option = document.createElement('option');
    option.value = category_name;
    option.textContent = category_name;
    select.appendChild(option);
  });

  if (previousValue) select.value = previousValue;
};

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('form.event-form');
  if (!form) return;

  const isEdit = window.location.pathname.includes('/edit');
  const pathParts = window.location.pathname.split('/');
  const eventId = isEdit ? pathParts[3] : null;

  try {
    await populateCategorySelect();

    const user = await getCurrentUser();
    if (user && user.full_name) {
      const orgInput = document.getElementById('organizer');
      if (orgInput) orgInput.value = user.full_name;
    }

    if (isEdit && eventId) {
      const event = await getEvent(eventId);
      if (event) {
        if (document.getElementById('title')) document.getElementById('title').value = event.title || '';
        if (document.getElementById('description')) document.getElementById('description').value = event.description || '';
        if (document.getElementById('category')) document.getElementById('category').value = event.category || '';
        if (document.getElementById('status')) document.getElementById('status').value = event.dbStatus || event.status || 'open';
        if (document.getElementById('date')) document.getElementById('date').value = event.event_date || '';
        if (document.getElementById('capacity')) document.getElementById('capacity').value = event.capacity || '';
        if (document.getElementById('start-time')) document.getElementById('start-time').value = event.start_time || '';
        if (document.getElementById('end-time')) document.getElementById('end-time').value = event.end_time || '';
        if (document.getElementById('location')) document.getElementById('location').value = event.location || '';
      }
    }
  } catch (error) {
    console.error("Failed to load initial data", error);
  }

  const inputs = form.querySelectorAll('input, select, textarea');

  const validateAllFields = () => {
    let valid = true;

    inputs.forEach((input) => {
      if (input.hasAttribute('readonly')) return;
      if (input.type === 'submit' || input.type === 'button') return;
      if (!validateField(input)) valid = false;
    });

    return valid;
  };

  // Clear error messages on input or change events
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        setFieldError(input, '');
      }
    });

    input.addEventListener('change', () => {
      if (input.value.trim()) {
        setFieldError(input, '');
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.dataset.valid = 'false';
    if (!validateAllFields()) {
      return;
    }
    form.dataset.valid = 'true';
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    // Capacity must be number
    data.capacity = Number(data.capacity);
    
    // Convert 'date' to 'event_date'
    data.event_date = data.date;
    delete data.date;
    
    // Convert 'start-time' to 'start_time'
    data.start_time = data['start-time'];
    delete data['start-time'];
    
    // Convert 'end-time' to 'end_time'
    data.end_time = data['end-time'];
    delete data['end-time'];
    
    let res;
    if (isEdit) {
        res = await updateEvent(eventId, data);
    } else {
        res = await createEvent(data);
    }
    
    if (res.ok) {
        notifySuccess(isEdit ? "Changes saved" : "Event created");
        setTimeout(() => window.location.href = '/admin/events', 800);
    } else {
        if (res.status === 400 && res.data?.fields) {
            Object.entries(res.data.fields).forEach(([field, message]) => {
                let inputId = field;
                if (field === 'event_date') inputId = 'date';
                if (field === 'start_time') inputId = 'start-time';
                if (field === 'end_time') inputId = 'end-time';
                
                const inputEl = document.getElementById(inputId);
                if (inputEl) setFieldError(inputEl, message);
            });
            notifyError("Please fix the highlighted errors.");
        } else {
            notifyError(res.data?.error || "Failed to save event");
        }
    }
  });
  
  const deleteBtn = document.getElementById('delete-event-btn');
  if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
          const confirmed = await showConfirmModal("Are you sure you want to permanently delete this event? This action cannot be undone.", "Delete", "btn-danger");
          if (!confirmed) return;
          
          const res = await deleteEvent(eventId);
          if (res.ok) {
              notifySuccess("Event deleted");
              setTimeout(() => window.location.href = '/admin/events', 800);
          } else {
              notifyError(res.data?.error || "Failed to delete event");
          }
      });
  }
});
