#include "opensebem.h"

void setup()
{
    OpenSebem::switchToActivity(new AStandby, false);
    OpenSebem::reset();
}

void loop()
{
    OpenSebem::oneLoopIteration();
    delay(100);
}
