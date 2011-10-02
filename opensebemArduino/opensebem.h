#ifndef __opensebem_h__
#define __opensebem_h__

#include "keyboard.h"
#include "sound.h"
#include "display.h"
#include "activity.h"
#include "activity-standby.h"
#include "activity-guessthenumber.h"
#include "activity-middlenumber.h"

class OpenSebem {
    private:
        static Activity *m_activity;
        static Keyboard *m_keyboard;
        static Sound *m_sound;
        static Display *m_display;
        
        static int m_tries;
    public:
        OpenSebem() {
            OpenSebem::m_activity = 0;
            OpenSebem::m_tries = 0;
            
            OpenSebem::switchToActivity(new AStandby, false);
            OpenSebem::reset();
            OpenSebem::oneLoopIteration();
            /* FIXME: call OpenSebem::oneLoopIteration() every 100ms */
        }
        ~OpenSebem() {
            delete m_activity;
        }
        
        static void switchToActivity(Activity *activity, bool keepScreenContents);
        
        static Keyboard *keyboard() { return m_keyboard; }
        static Sound *sound() { return m_sound; }
        static Display *display() { return m_display; }
        
        static void prompt(int initialDigit, int maxDigitSize, char promptCharacter);
        
        static void buttonPress(Button);
        
        static int pointsByNumberOfTries();

        static void reset();

        static void oneLoopIteration();
};

#endif /* __opensebem_h__ */
