from typing import Sequence, Type

from factory.alchemy import SQLAlchemyModelFactory

from api.factories.answer import AnswerFactory
from api.factories.mark import MarkFactory, MarkHistoryFactory
from api.factories.student import StudentFactory

all_factories: Sequence[Type[SQLAlchemyModelFactory]] = [
    AnswerFactory,
    MarkFactory,
    MarkHistoryFactory,
    StudentFactory,
]
