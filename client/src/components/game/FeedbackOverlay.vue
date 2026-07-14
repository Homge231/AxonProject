<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-[90%] max-w-md shadow-2xl text-white">
      <h2 class="text-2xl font-bold mb-4 text-center">Match Complete!</h2>
      <p class="text-gray-200 text-center mb-6">How was your experience?</p>

      <div class="flex justify-center gap-2 mb-6">
        <button
          v-for="star in 5"
          :key="star"
          @click="rating = star"
          class="text-4xl transition-transform hover:scale-110 focus:outline-none"
          :class="rating >= star ? 'text-yellow-400' : 'text-gray-400/50'"
        >
          ★
        </button>
      </div>

      <textarea
        v-model="comments"
        rows="4"
        placeholder="Share your thoughts (optional)..."
        class="w-full bg-black/20 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
      ></textarea>

      <div class="flex gap-4">
        <button 
          @click="$emit('close')" 
          class="flex-1 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="isSubmitting || rating === 0"
          class="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {{ isSubmitting ? 'Sending...' : 'Submit Feedback' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 1. Import the specific function from your api.ts file
import { fetchWithAuth } from "../../services/api";
import { useMatchStore } from '../../stores/matchStore';

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits(['close', 'success']);

const rating = ref(0);
const comments = ref('');
const isSubmitting = ref(false);

const matchStore = useMatchStore();

const submit = async () => {
  if (rating.value === 0) return;
  isSubmitting.value = true;

  try {
    // 2. Use fetchWithAuth with POST method and stringified body
    const response = await fetchWithAuth('/api/game/feedback', {
      method: 'POST',
      body: JSON.stringify({
        // Dùng 1 UUID giả để test lọt qua Supabase. 
        // Sau khi test thành công, bạn nhớ đổi lại thành ID thật của user nhé!
        user_id: "123e4567-e89b-12d3-a456-426614174000", 
        
        // Tạo session_id giả bằng timestamp để tránh bị lỗi "Trùng lặp feedback" khi test nhiều lần
        session_id: "test-session-" + Date.now(), 
        
        rating: rating.value,
        comments: comments.value
      })
    });
    
    // 3. Handle HTTP status codes manually since native fetch doesn't throw on 4xx/5xx
    if (!response.ok) {
      if (response.status === 409) {
        alert('You have already submitted feedback for this match.');
        return; 
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    emit('success');
    emit('close');
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    alert('An error occurred. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>