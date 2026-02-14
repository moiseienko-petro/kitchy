from .adapter import SoundAdapter

class NoopSoundAdapter(SoundAdapter):
    def play_timer_finished(self) -> None:
        print("[SOUND] TIMER FINISHED")